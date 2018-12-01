'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost/nutrition_counter';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-nutrition_counter';
exports.PORT = process.env.PORT || 8080;