import { Container, interfaces } from "inversify";
import { TYPES } from "./constants/types";
import { UserFactory } from "./factories/user.factory";
import { UserService } from "./services/user.service";
import { DatabaseService } from "./services/database.service";
import { AuthMiddleware } from "./middleware/auth.middleware";
import { AdminMiddleware } from "./middleware/role.middleware";
import { AiFactory } from "./factories/ai.factory";
import { AiService } from './services/ai.service';
import { AppSettings } from "./interfaces/AppSettings";
import { AppSettingsService } from "./services/appSettings.service";

export let container = new Container();

container.bind<DatabaseService>(TYPES.DatabaseService).to(DatabaseService).inSingletonScope();

container.bind<UserFactory>(TYPES.UserFactory).to(UserFactory);
container.bind<UserService>(TYPES.UserService).to(UserService);

container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware);
container.bind<AdminMiddleware>(TYPES.AdminMiddleware).to(AdminMiddleware);

container.bind<AiService>(TYPES.AiService).to(AiService);
container.bind<AiFactory>(TYPES.AiFatory).to(AiFactory);

container.bind<AppSettingsService>(TYPES.AppSettingsService).to(AppSettingsService);
