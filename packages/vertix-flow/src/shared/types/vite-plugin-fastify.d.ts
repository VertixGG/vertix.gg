declare module "vite-plugin-fastify" {
    interface FastifyPluginOptions {
        appPath: string;
        serverPath: string;
        host?: string;
        port?: number;
    }

    export default function fastify(options: FastifyPluginOptions): any;
}
