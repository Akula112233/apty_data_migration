const validationsJoinQuery = `
select
vl.name, vl.properties, vl.is_deleted,
vts.properties, vts.is_deleted,
vms.locale_id, vms.message, vms.is_deleted
from assist.forms as fr
    join assist.validations as vl
        on vl.form_id = fr.id
    join assist.validators as vts
        on vts.validation_id = vl.id
    join assist.validators_messages as vms
        on vms.validator_id = vts.id
where fr.application_id = $1 and vl.is_deleted='false'
`;

const getValidations = `
select vl.*
from assist.forms as fr
join assist.validations as vl
        on vl.form_id = fr.id
where fr.application_id = $1 and vl.is_deleted='false'
`;

const getValidators = `
select vts.*
from assist.forms as fr
    join assist.validations as vl
        on vl.form_id = fr.id
    join assist.validators as vts
        on vts.validation_id = vl.id
where fr.application_id = $1 and vts.is_deleted='false'
`;

const getValidatorMessages = `
select vms.*
from assist.forms as fr
    join assist.validations as vl
        on vl.form_id = fr.id
    join assist.validators as vts
        on vts.validation_id = vl.id
    join assist.validators_messages as vms
        on vms.validator_id = vts.id
where fr.application_id = $1 and vms.is_deleted='false'
`;

const insertValidations = `
INSERT INTO assist.validations (form_id, name, properties, is_deleted, created_date, created_by, updated_date, updated_by)
SELECT form_id, name, properties, is_deleted, created_date, created_by, updated_date, updated_by FROM json_populate_recordset(NULL::assist.validations,
  $1
)
RETURNING id
`

const insertValidators = `
INSERT INTO assist.validators (validation_id, properties, is_deleted, created_date, created_by, updated_date, updated_by)
SELECT validation_id, properties, is_deleted, created_date, created_by, updated_date, updated_by FROM json_populate_recordset(NULL::assist.validators,
  $1
)
RETURNING id
`

const insertValidatorMessages = `
INSERT INTO assist.validators_messages (validator_id, locale_id, message, is_deleted, created_date, created_by, updated_date, updated_by)
SELECT validator_id, locale_id, message, is_deleted, created_date, created_by, updated_date, updated_by FROM json_populate_recordset(NULL::assist.validators_messages,
  $1
)
RETURNING id
`

export {
    validationsJoinQuery,
    getValidations,
    insertValidations,
    getValidators,
    insertValidators,
    getValidatorMessages,
    insertValidatorMessages
};
