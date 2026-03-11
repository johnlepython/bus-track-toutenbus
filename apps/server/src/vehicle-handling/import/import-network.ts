import { eq, sql } from "drizzle-orm";

import { database } from "../../core/database/database.js";
import { networksTable } from "../../core/database/schema.js";
import { mapRowsToEntity } from "../../core/database/utils.js";

export async function importNetwork(ref: string) {
	const rows = await database.execute(sql`SELECT * FROM public.import_network(${ref})`);

	let [network] = mapRowsToEntity(networksTable, rows);

	// Ensure TOUTENBUS is always visible in the Data tab after re-imports.
	if (network && network.ref === "TOUTENBUS" && !network.hasVehiclesFeature) {
		const [updatedNetwork] = await database
			.update(networksTable)
			.set({ hasVehiclesFeature: true })
			.where(eq(networksTable.id, network.id))
			.returning();

		if (updatedNetwork) {
			network = updatedNetwork;
		}
	}

	return network!;
}
