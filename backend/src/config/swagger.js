const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Gerenciamento de Tarefas',
            version: '1.0.0',
            description: 'Documentação da API REST desenvolvida em Node.js, Express e MySQL para controle de usuários, tarefas, categorias e tags.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor Local de Desenvolvimento'
            }
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Insira o token JWT gerado no login no formato: Bearer <seu_token>'
                }
            }
        }
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js'] 
};

const swaggerSpec = swaggerJSDoc(options);

function swaggerDocs(app) {
    // Rota onde a documentação visual estará disponível
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    
    console.log('📄 Documentação Swagger disponível em: http://localhost:3000/api-docs');
}

module.exports = swaggerDocs;