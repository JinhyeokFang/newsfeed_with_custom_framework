import { Router } from 'express';
import express from 'express';
import { Container } from './container';

export class Server {
  private expressApp = express();
  private baseRouter: Router;

  constructor(middlewares: ((req, res, next) => void)[]) {
    middlewares.forEach((middleware) => {
      this.expressApp.use(middleware);
    }, this);
  }

  private addControllerToRouter(controller: any) {
    const router = Router();
    const prototype = controller.prototype;
    const controllerInstance = Container.get(controller.name) as {
      basePath?: string;
    };

    if (controllerInstance.basePath === undefined) {
      throw new Error(`${controller.name} is not a Controller`);
    }

    Object.getOwnPropertyNames(prototype)
      .filter(
        (property) =>
          Reflect.getMetadata(controllerInstance[property].name, controller) !==
          undefined,
      )
      .forEach((property) => {
        const metadata = Reflect.getMetadata(
          controllerInstance[property].name,
          controller,
        );
        router[metadata.method](
          metadata.path,
          ...metadata.handlers.map((handler) =>
            handler.bind(controllerInstance),
          ),
        );
      });
    this.baseRouter.use(controllerInstance.basePath, router);
  }

  injectController(controllers: any[]) {
    this.baseRouter = Router();
    controllers.forEach(this.addControllerToRouter, this);
    this.expressApp.use(this.baseRouter);
  }

  get app() {
    return this.expressApp;
  }

  start(port: number, callback: () => void) {
    this.expressApp.listen(port, callback);
  }
}
