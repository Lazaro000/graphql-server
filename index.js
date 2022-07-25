import { gql } from "apollo-server";
import { ApolloServer, UserInputError } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { v1 as uuid } from "uuid";
import axios from "axios";
import "./db.js";
import { Person } from "./models/person.js";
import { User } from "./models/user.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = "SECRET_KEY";

const persons = [
  {
    age: 23,
    name: "Midu",
    phone: "034-1234567",
    street: "Calle Frontend",
    city: "Barcelona",
    id: "3d594650-3436-11e9-bc57-8b80ba54c431",
  },
  {
    name: "Youseff",
    phone: "044-123456",
    street: "Avenida Fullstack",
    city: "Mataro",
    id: "3d599470-3436-11e9-bc57-8b80ba54c431",
  },
  {
    name: "Itzi",
    street: "Pasaje Testing",
    city: "Ibiza",
    id: "3d599471-3436-11e9-bc57-8b80ba54c431",
  },
];

const typeDefinitions = gql`
  enum YesNo {
    YES
    NO
  }

  type Address {
    street: String!
    city: String!
  }

  type Person {
    canDrink: Boolean
    name: String!
    phone: String
    address: Address!
    address2: String!
    check: String!
    id: ID!
  }

  type User {
    username: String!
    friends: [Person]!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
    me: User
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(name: String!, phone: String!): Person
    createUser(username: String!): User
    login(username: String!, password: String!): Token
  }
`;

const resolvers = {
  Query: {
    personCount: () => Person.collection.countDocuments(),
    allPersons: async (parent, args) => {
      if (!args.phone) return Person.find({});

      return Person.find({ phone: { $exists: args.phone === "YES" } });
    },
    findPerson: (parent, args) => {
      const { name } = args;

      return Person.findOne({ name });
    },
    me: (parent, args, context) => {
      return context.currentUser;
    },
  },
  Mutation: {
    addPerson: async (parent, args) => {
      const person = new Person({ ...args });

      try {
        await person.save();
      } catch (err) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }

      return person;
    },
    editNumber: async (parent, args) => {
      const person = await Person.findOne({ name: args.name });

      if (!person) return new Error("User not found");

      person.phone = args.phone;

      try {
        await person.save();
      } catch (err) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }

      return person;
    },
    createUser: (parent, args) => {
      const user = new User({ username: args.username });

      return user.save().catch((err) => {
        throw new UserInputError(err.messagem, {
          invalidArgs: args,
        });
      });
    },
    login: async (parent, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "midupassword")
        throw new UserInputError("Wrong credentials");

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return {
        value: jwt.sign(userForToken, JWT_SECRET),
      };
    },
  },
  Person: {
    canDrink: (parent) => parent.age > 18,
    address: (parent) => {
      return {
        street: parent.street,
        city: parent.city,
      };
    },
    address2: (parent) => `${parent.street}, ${parent.city}`,
    check: () => "laza",
  },
};

const server = new ApolloServer({
  typeDefs: typeDefinitions,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;

    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const token = auth.substring(7);

      const { id } = jwt.verify(token, JWT_SECRET);
      const currentUser = await User.findById(id).populate("friends");

      return { currentUser };
    }
  },
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
