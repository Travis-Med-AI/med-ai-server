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
    JobService: Symbol.for('JobService'),
    ModelService: Symbol.for('ModelService'),
    StudyService: Symbol.for('StudyService'),


    AppSettingsService: Symbol.for('AppSettingsService')
}