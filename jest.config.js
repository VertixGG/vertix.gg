module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",

	testRegex: "(/test/.*\\.spec\\.ts)$",

	transform: {
		"^.+\\.(ts|tsx)?$": [ "ts-jest", { tsconfig: "./test/tsconfig.json" } ],
	},

	setupFilesAfterEnv: [ "<rootDir>/test/__setup__.ts" ],

	moduleNameMapper: {
		"^@internal/(.*)": "<rootDir>/src/$1",
		"^@vertix/(.*)": "<rootDir>/src/vertix/$1",
	},

	logHeapUsage: true,
};
