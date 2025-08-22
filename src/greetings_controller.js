const greetingSchema = {
   response: {
      200: {
         properties: {
            message: { type: 'string' }
         },
         required: ['message']
      }
   }
}

const greetingController = (fastify, options, done) => {
   fastify.get('/', { schema: greetingSchema }, (request, reply) => {
      return {
         message: "Hello Word from greetings",
      }
   });

   done();
}

export default greetingController;