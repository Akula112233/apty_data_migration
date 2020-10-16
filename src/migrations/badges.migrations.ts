import {
	getBadges,
	insertBadges,
	getAnnouncementsMessages,
	insertAnnouncementsMessages,
} from "../queries/badges.queries";
import { PoolClient } from "pg";

const migrateBadges = async (
    applicationid: any,
	formIDsMap: any,
	sourceClient: PoolClient,
	destClient: PoolClient
) => {
	try {
		const badgesIDMap = await migrateBadgesTable(
            applicationid,
			formIDsMap,
			sourceClient,
			destClient
		);

		if (typeof badgesIDMap !== "object") return badgesIDMap;

		const announcementsMessagesIDMap = await migrateAnnMessTable(
			applicationid,
			badgesIDMap,
			sourceClient,
			destClient
		);

		return [badgesIDMap, announcementsMessagesIDMap];
	} catch (err) {
		return err;
	}
};

const migrateBadgesTable = async (
	applicationid: any,
	formsIDsMap: any,
	sourceClient: PoolClient,
	destClient: PoolClient
) => {
	try {
		// Track old and new id for Badges table
		const badgesIDMap: any = new Map();

		// Querying for Badges table
		const resultsBadges = await sourceClient.query(getBadges, [applicationid]);

		// Initialize old id map to null
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < resultsBadges.rows.length; i++) {
			const oldId = resultsBadges.rows[i].id;
			// @ts-ignore
			badgesIDMap[oldId] = null;
			resultsBadges.rows[i].form_id =
				formsIDsMap[resultsBadges.rows[i].form_id];
		}

		// Insert rows of Badges table into destClient
		const newBadgesIds = await destClient.query(insertBadges, [
			JSON.stringify(resultsBadges.rows),
		]);

		// Mapping old IDs to new IDs
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < resultsBadges.rows.length; i++) {
			// @ts-ignore
			badgesIDMap[resultsBadges.rows[i].id] = newBadgesIds.rows[i].id;
		}

		return badgesIDMap;
	} catch (err) {
		return err.stack;
	}
};

const migrateAnnMessTable = async (
	applicationid: any,
	badgesIDMap: any,
	sourceClient: PoolClient,
	destClient: PoolClient
) => {
	try {
		// Track old and new id for Announcements Messages table
		const AnnMessIDMap: any = new Map();

		// Querying for Announcements Messages table
		const resultsAnnMess = await sourceClient.query(getAnnouncementsMessages, [
			applicationid,
		]);

		// Mapping the old badges_id to new IDs in badgesIDMap
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < resultsAnnMess.rows.length; i++) {
			// @ts-ignore
			resultsAnnMess.rows[i].badge_id =
				badgesIDMap[resultsAnnMess.rows[i].badge_id];
		}

		// Initialize old ID map to null
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < resultsAnnMess.rows.length; i++) {
			const oldId = resultsAnnMess.rows[i].id;
			// @ts-ignore
			AnnMessIDMap[oldId] = null;
		}

		// Insert rows of Announcements Messages table into destClient
		const newAnnMessIds = await destClient.query(insertAnnouncementsMessages, [
			JSON.stringify(resultsAnnMess.rows),
		]);

		// Mapping old IDs to new IDs
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < resultsAnnMess.rows.length; i++) {
			// @ts-ignore
			AnnMessIDMap[resultsAnnMess.rows[i].id] = newAnnMessIds.rows[i].id;
		}

		return AnnMessIDMap;
	} catch (err) {
		return err.stack;
	}
};

export { migrateBadges };
