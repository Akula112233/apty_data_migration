import {
    getOnboardingGroups,
    insertOnboardingGroups,
    getOnboardingGroupTexts,
    insertOnboardingGroupTexts,
    getOnboardingList,
    insertOnboardingList,
} from "../queries/onboardingGroups.queries";
import {PoolClient} from "pg";

const migrateOnboardingGroups = async (
    applicationid: any,
    destApplicationId: any,
    contentIDsMap: any,
    flowsIDMap: any,
    sourceClient: PoolClient,
    destClient: PoolClient
) => {
    try {
        const onboardingGroupsIDMap = await migrateOnboardingGroupsTable(
            applicationid,
            destApplicationId,
            sourceClient,
            destClient,
        );

        if (typeof onboardingGroupsIDMap !== "object") return onboardingGroupsIDMap;

        const onboardingGroupTextsIDMap = await migrateOnboardingGroupTexts(
            applicationid,
            onboardingGroupsIDMap,
            sourceClient,
            destClient
        );

        const onboardingListsIDMap = await migrateOnbaordingLists(
            applicationid,
            onboardingGroupsIDMap,
            contentIDsMap,
            flowsIDMap,
            sourceClient,
            destClient
        );

        return [onboardingGroupsIDMap, onboardingGroupTextsIDMap, onboardingListsIDMap];
    } catch (error) {
        return error;
    }
};

const migrateOnboardingGroupsTable = async (
    applicationid: any,
    destApplicationId: any,
    sourceClient: PoolClient,
    destClient: PoolClient
) => {
    try {
        const onboardingGroupsIDMap: any = new Map(); // **Map for tracking the new and old Validation IDs**

        // **Querying for the results of on_boarding_groups table using the getOnboardingGroups query and a specific app number**
        const resultsOnboardingGroups = await sourceClient.query(getOnboardingGroups, [
            applicationid,
        ]);

        // **Making a starting map of the old IDs for onboardingGroups and initializing to null**
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < resultsOnboardingGroups.rows.length; i++) {
            const oldId = resultsOnboardingGroups.rows[i].id;
            // @ts-ignore
            onboardingGroupsIDMap[oldId] = null;
            resultsOnboardingGroups.rows[i].segments = []
            resultsOnboardingGroups.rows[i].app_id = destApplicationId
        }

        // **Inserting elements queried above and returning the IDs for onboardingGroups**
        const newOnboardingGroupsIds = await destClient.query(insertOnboardingGroups, [
            JSON.stringify(resultsOnboardingGroups.rows),
        ]);

        // **Finishing the map of onboardingGroup IDs using the new IDs returned by the insert query above**
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < resultsOnboardingGroups.rows.length; i++) {
            // @ts-ignore
            onboardingGroupsIDMap[resultsOnboardingGroups.rows[i].id] = newOnboardingGroupsIds.rows[i].id;
        }

        return onboardingGroupsIDMap;
    } catch (error) {
        return error.stack;
    }
};

const migrateOnboardingGroupTexts = async (
    applicationid: any,
    onboardingGroupsIDMap: any,
    sourceClient: PoolClient,
    destClient: PoolClient
) => {
    try {
        const onboardingGroupTextsIDMap: any = new Map(); // **Map for tracking the new and old GroupTexts IDs**

        // **Querying for the results of onboarding_group_texts using the getOnboardingGroupTexts query and a specific app number**
        const resultsOnboardingGroupTexts = await sourceClient.query(getOnboardingGroupTexts, [
            applicationid,
        ]);

        // **Mapping the old onboarding_group_id to the new ones using onboardingGroupsIDMap made earlier**
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < resultsOnboardingGroupTexts.rows.length; i++) {
            // @ts-ignore
            onboardingGroupTextsIDMap[resultsOnboardingGroupTexts.rows[i].id] = null
            resultsOnboardingGroupTexts.rows[i].onboarding_group_id = onboardingGroupsIDMap[resultsOnboardingGroupTexts.rows[i].onboarding_group_id];
        }

        // **Inserting elements queried above**
        const newOnboardingGroupTextsIDs = await destClient.query(insertOnboardingGroupTexts, [
            JSON.stringify(resultsOnboardingGroupTexts.rows),
        ]);

        // **Finishing the map of onboardingGroupTexts IDs using the new IDs returned by the insert query above**
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < resultsOnboardingGroupTexts.rows.length; i++) {
            // @ts-ignore
            onboardingGroupTextsIDMap[resultsOnboardingGroupTexts.rows[i].id] = newOnboardingGroupTextsIDs.rows[i].id;
        }

        return onboardingGroupTextsIDMap
    } catch (error) {
        return error.stack;
    }
};

const migrateOnbaordingLists = async (
    applicationid: any,
    onboardingGroupsIDMap: any,
    contentIDsMap: any,
    flowsIDMap: any,
    sourceClient: PoolClient,
    destClient: PoolClient
) => {
    try {
        const onboardingGroupListIDMap: any = new Map(); // **Map for tracking the new and old GroupTexts IDs**

        // **Querying for the results of on_boarding_lists using the getOnboardingList query and a specific app number**
        const resultsOnboardingList = await sourceClient.query(
            getOnboardingList,
            [applicationid]
        );

        // **Mapping the old item_id's to the new ones using contentIDsMap and flowsIDsMap made earlier, dependent on the "item_type" field for each item**
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < resultsOnboardingList.rows.length; i++) {
            resultsOnboardingList.rows[i].group_id = onboardingGroupsIDMap[resultsOnboardingList.rows[i].group_id]
            // @ts-ignore
            onboardingGroupListIDMap[resultsOnboardingList.rows[i].id] = null
            if (resultsOnboardingList.rows[i].item_type === 4) {
                resultsOnboardingList.rows[i].item_id = flowsIDMap[resultsOnboardingList.rows[i].item_id];
            } else if (resultsOnboardingList.rows[i].item_type === 5) {
                resultsOnboardingList.rows[i].item_id = contentIDsMap[resultsOnboardingList.rows[i].item_id];
            }
        }


        // **Inserting elements queried above and returning the IDs for Validators**
        const newOnboardingGroupListsIDMap = await destClient.query(
            insertOnboardingList,
            [JSON.stringify(resultsOnboardingList.rows)]
        );

        // **Finishing the map of onboardingList IDs using the new IDs returned by the insert query above**
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < resultsOnboardingList.rows.length; i++) {
            // @ts-ignore
            onboardingGroupListIDMap[resultsOnboardingList.rows[i].id] = newOnboardingGroupListsIDMap.rows[i].id;
        }

        return onboardingGroupListIDMap
    } catch (error) {
        return error.stack;
    }
};

export {migrateOnboardingGroups};
