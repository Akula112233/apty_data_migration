const getOnboardingGroups = `
select og.*
from assist.on_boarding_groups as og
where og.app_id = $1
`;

const insertOnboardingGroups = `
INSERT INTO assist.on_boarding_groups (app_id, priority, deployment, segments, is_deleted, created_date, created_by, updated_date, updated_by)
SELECT app_id, priority, deployment, segments, is_deleted, created_date, created_by, updated_date, updated_by FROM json_populate_recordset(NULL::assist.on_boarding_groups,
  $1
)
RETURNING id
`;

const getOnboardingGroupTexts = `
select ogt.*
from assist.on_boarding_groups as og
join assist.onboarding_group_texts as ogt
    on ogt.onboarding_group_id = og.id
where og.app_id = $1
`;

const insertOnboardingGroupTexts = `
INSERT INTO assist.onboarding_group_texts (onboarding_group_id, locale_id, group_name, is_deleted, created_date, created_by, updated_date, updated_by)
SELECT onboarding_group_id, locale_id, group_name, is_deleted, created_date, created_by, updated_date, updated_by FROM json_populate_recordset(NULL::assist.onboarding_group_texts,
  $1
)
RETURNING id
`;

const getOnboardingList = `
select ol.*
from assist.on_boarding_groups as og
join assist.on_boarding_list ol
    on ol.group_id = og.id
where og.app_id = $1
`;

const insertOnboardingList = `
INSERT INTO assist.on_boarding_list (item_type, item_id, group_id, priority, is_deleted, created_date, created_by, updated_date, updated_by)
SELECT item_type, item_id, group_id, priority, is_deleted, created_date, created_by, updated_date, updated_by FROM json_populate_recordset(NULL::assist.on_boarding_list,
  $1
)
RETURNING id
`;

export {
    getOnboardingGroups,
    insertOnboardingGroups,
    getOnboardingGroupTexts,
    insertOnboardingGroupTexts,
    getOnboardingList,
    insertOnboardingList
};
