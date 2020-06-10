export const TYPES = {
    DatabaseService: Symbol.for('DatabaseService'),
    DatabaseConnection: Symbol.for('DatabaseConnection'),
    
    UserService: Symbol.for('UserService'),
    UserFactory: Symbol.for('UserFactory'),

    AuthMiddleware: Symbol.for('AuthMiddleware'),
    AdminMiddleware: Symbol.for('AdminMiddleware'),

    AiFatory: Symbol.for('AiFactory'),
    AiService: Symbol.for('AiService'),

    AppSettingsService: Symbol.for('AppSettingsService')
}