import { gql } from "apollo-server";
import { ApolloServer, UserInputError } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { v1 as uuid } from "uuid";

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
  type Address {
    street: String!
    city: String!
  }

  type Person {
    name: String!
    phone: String
    address: Address!
    address2: String!
    check: String!
    id: ID!
  }

  type Query {
    personCount: Int!
    allPersons: [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
  }
`;

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: () => persons,
    findPerson: (parent, args) => {
      const { name } = args;

      return persons.find((person) => person.name === name);
    },
  },
  Mutation: {
    addPerson: (parent, args) => {
      // const {name, phone, street, city} = args;

      if (persons.find((p) => p.name === args.name))
        throw new UserInputError("Name must be unique", {
          invalidArgs: args.name,
        });

      const person = { ...args, id: uuid() };
      persons.push(person);

      return person;
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
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
