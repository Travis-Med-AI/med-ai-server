import { Container } from "inversify";
import { TYPES } from "./constants/types";
import { UserFactory } from "./factories/user.factory";
import { UserService } from "./services/user.service";
import { DatabaseService } from "./services/database.service";
import { AuthMiddleware } from "./middleware/auth.middleware";
import { AdminMiddleware } from "./middleware/role.middleware";
import { AppSettingsService } from "./services/appSettings.service";
import { EvalService } from "./services/eval.service";
import { JobService } from "./services/job.service";
import { ModelService } from "./services/model.service";
import { StudyService } from "./services/study.service";
import { RealtimeService } from "./services/realtime.service";
import { MonitorSerivice } from "./services/monitor.service";
import { EvalFactory } from "./factories/eval.factory";
import { JobFactory } from "./factories/job.factory";
import { ModelFactory } from "./factories/model.factory";
import { StudyFactory } from "./factories/study.factory";
import { MonitorFactory } from "./factories/monitor.factory";
import { ResponseFactory } from "./factories/response.factory";
import { RealtimeFactory } from "./factories/realtime.factory";
import { ExperimentService } from './services/experiment.service'
import { ExperimentFactory } from "./factories/experiment.factory";
import { ResultMiddleware } from "./middleware/result.middleware";

export let container = new Container();

container.bind<DatabaseService>(TYPES.DatabaseService).to(DatabaseService).inSingletonScope();

container.bind<UserFactory>(TYPES.UserFactory).to(UserFactory);
container.bind<UserService>(TYPES.UserService).to(UserService);

container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware);
container.bind<AdminMiddleware>(TYPES.AdminMiddleware).to(AdminMiddleware);
container.bind<ResultMiddleware>(TYPES.ResultMiddleware).to(ResultMiddleware);

container.bind<EvalService>(TYPES.EvalService).to(EvalService);
container.bind<EvalFactory>(TYPES.EvalFactory).to(EvalFactory);

container.bind<ExperimentService>(TYPES.ExperimentService).to(ExperimentService);
container.bind<ExperimentFactory>(TYPES.ExperimentFactory).to(ExperimentFactory);

container.bind<JobService>(TYPES.JobService).to(JobService);
container.bind<JobFactory>(TYPES.JobFactory).to(JobFactory);

container.bind<ModelService>(TYPES.ModelService).to(ModelService);
container.bind<ModelFactory>(TYPES.ModelFactory).to(ModelFactory);

container.bind<StudyService>(TYPES.StudyService).to(StudyService);
container.bind<StudyFactory>(TYPES.StudyFactory).to(StudyFactory);

container.bind<RealtimeService>(TYPES.RealtimeService).to(RealtimeService).inRequestScope();
container.bind<RealtimeFactory>(TYPES.RealtimeFactory).to(RealtimeFactory);

container.bind<MonitorSerivice>(TYPES.MonitorService).to(MonitorSerivice);
container.bind<MonitorFactory>(TYPES.MonitorFactory).to(MonitorFactory);

container.bind<ResponseFactory>(TYPES.ResponseFactory).to(ResponseFactory);

container.bind<AppSettingsService>(TYPES.AppSettingsService).to(AppSettingsService);
