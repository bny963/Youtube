const nextJest = require('next/jest')

const createJestConfig = nextJest({
    dir: './',
})

const customJestConfig = {
    // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // もしあれば
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)