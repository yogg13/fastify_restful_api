import Fastify from "fastify";
import greetingController from "./greetings_controller.js";
import fastifyMysql from "@fastify/mysql";
import bookController from "./book_controller.js";

const fastify = Fastify({
   logger: true,
});

fastify.register(fastifyMysql, {
   host: 'localhost',
   user: 'root',
   password: 'MYQEP1913',
   port: 3309,
   database: 'uts_framework',
   promise: true,
});

fastify.register(greetingController, { prefix: '/greetings' });
fastify.register(bookController, { prefix: '/books' });

try {
   fastify.listen({ port: 8081 });
} catch (error) {
   fastify.log.error(error);
   process.exit(1);
}