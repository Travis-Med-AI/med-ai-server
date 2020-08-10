export const TYPES = {
    DatabaseService: Symbol.for('DatabaseService'),
    DatabaseConnection: Symbol.for('DatabaseConnection'),
    
    UserService: Symbol.for('UserService'),
    UserFactory: Symbol.for('UserFactory'),

    AuthMiddleware: Symbol.for('AuthMiddleware'),
    AdminMiddleware: Symbol.for('AdminMiddleware'),

    AiFatory: Symbol.for('AiFactory'),
    AiService: Symbol.for('AiService'),

    EvalService: Symbol.for('EvalService'),
    EvalFactory: Symbol.for('EvalFactory'),

    JobService: Symbol.for('JobService'),
    JobFactory: Symbol.for('JobFactory'),

    ModelService: Symbol.for('ModelService'),
    ModelFactory: Symbol.for('ModelFactory'),
    
    StudyService: Symbol.for('StudyService'),
    StudyFactory: Symbol.for('StudyFactory'),

    MonitorService: Symbol.for('MonitorService'),
    MonitorFactory: Symbol.for('MonitorFactory'),
    Logger: Symbol.for('Logger'),

    ResponseFactory: Symbol.for('ResponseFactory'),

    AppSettingsService: Symbol.for('AppSettingsService')
}