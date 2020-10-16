const getBadges = `
SELECT badges.*
FROM assist.badges badges
    JOIN assist.forms forms
        ON badges.form_id = forms.id
WHERE badges.type = 2 and forms.application_id = $1 and badges.is_deleted = 'false'
`;

const insertBadges = `
INSERT INTO assist.badges (form_id, name, type, properties, external_unique_id, is_deleted, created_date, created_by, updated_date, updated_by)
SELECT form_id, name, type, properties, external_unique_id, is_deleted, created_date, created_by, updated_date, updated_by
FROM json_populate_recordset(NULL:: assist.badges, $1)
RETURNING id
`;

const getAnnouncementsMessages = `
SELECT ann_mess.*
FROM assist.announcements_messages ann_mess
    JOIN assist.badges badges
        ON ann_mess.badge_id = badges.id
    JOIN assist.forms forms
        ON badges.form_id = forms.id
WHERE ann_mess.is_deleted = 'false' and forms.application_id = $1
`;

const insertAnnouncementsMessages = `
INSERT INTO assist.announcements_messages (badge_id, locale_id, properties, is_deleted, created_date, created_by, updated_date, updated_by)
SELECT badge_id, locale_id, properties, is_deleted, created_date, created_by, updated_date, updated_by
FROM json_populate_recordset(NULL:: assist.announcements_messages, $1)
RETURNING id
`;

export{
    getBadges,
    insertBadges,
    getAnnouncementsMessages,
    insertAnnouncementsMessages
}