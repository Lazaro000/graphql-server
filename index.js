import { gql } from "apollo-server";
import { ApolloServer, UserInputError } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { v1 as uuid } from "uuid";
import axios from "axios";

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

  type Query {
    personCount: Int!
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
  }

  type Mutation {
    addPerson(
      name: String!
      phone: String
      street: String!
      city: String!
    ): Person
    editNumber(name: String!, phone: String!): Person
  }
`;

const resolvers = {
  Query: {
    personCount: () => persons.length,
    allPersons: async (parent, args) => {
      const { data: personsFromRestApi } = await axios.get(
        "http://localhost:3000/persons"
      );

      if (!args.phone) {
        return personsFromRestApi;
      }

      const byPhone = (person) =>
        args.phone === "YES" ? person.phone : !person.phone;

      return personsFromRestApi.filter(byPhone);
    },
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
    editNumber(parent, args) {
      const personIndex = persons.findIndex((p) => p.name === args.name);
      if (personIndex === -1) return null;

      const person = persons[personIndex];

      const updatedPerson = { ...person, phone: args.phone };
      persons[personIndex] = updatedPerson;

      return updatedPerson;
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
