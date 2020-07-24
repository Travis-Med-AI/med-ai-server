import { Container, interfaces } from "inversify";
import { TYPES } from "./constants/types";
import { UserFactory } from "./factories/user.factory";
import { UserService } from "./services/user.service";
import { DatabaseService } from "./services/database.service";
import { AuthMiddleware } from "./middleware/auth.middleware";
import { AdminMiddleware } from "./middleware/role.middleware";
import { AiFactory } from "./factories/ai.factory";
import { AppSettings } from "./interfaces/AppSettings";
import { AppSettingsService } from "./services/appSettings.service";
import { EvalService } from "./services/eval.service";
import { JobService } from "./services/job.service";
import { ModelService } from "./services/model.service";
import { StudyService } from "./services/study.service";
import { MonitorSerivice } from "./services/monitor.service";

export let container = new Container();

container.bind<DatabaseService>(TYPES.DatabaseService).to(DatabaseService).inSingletonScope();

container.bind<UserFactory>(TYPES.UserFactory).to(UserFactory);
container.bind<UserService>(TYPES.UserService).to(UserService);

container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware);
container.bind<AdminMiddleware>(TYPES.AdminMiddleware).to(AdminMiddleware);

container.bind<AiFactory>(TYPES.AiFatory).to(AiFactory);

container.bind<EvalService>(TYPES.EvalService).to(EvalService);
container.bind<JobService>(TYPES.JobService).to(JobService);
container.bind<ModelService>(TYPES.ModelService).to(ModelService);
container.bind<StudyService>(TYPES.StudyService).to(StudyService);

container.bind<MonitorSerivice>(TYPES.MonitorService).to(MonitorSerivice);

container.bind<AppSettingsService>(TYPES.AppSettingsService).to(AppSettingsService);
