/** @type {import('../src/model/source.ts').SourceOptions[]} */
const sources = [
	{
		id: "toutenbus_20",
		staticResourceHref: "https://gtfs-rt.infra-hubup.fr/toutenbus/current/gtfs",
		realtimeResourceHrefs: ["https://gtfs-rt.infra-hubup.fr/toutenbus/realtime"],
		getNetworkRef: () => "TOUTENBUS",
		getOperatorRef: () => "TOUTENBUS",
		getVehicleRef: (vehicle) => vehicle?.label,
		getDestination: (journey) => journey?.calls.at(-1)?.stop.name,
	},
];

/** @type {import('../src/configuration/configuration.ts').Configuration} */
const configuration = {
	computeDelayMs: 20_000,
	redisOptions: {
		url: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
		username: process.env.REDIS_USERNAME,
		password: process.env.REDIS_PASSWORD,
	},
	sources,
};

export default configuration;
