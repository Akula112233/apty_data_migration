const getFlows = `
SELECT *
FROM assist.flows
WHERE assist.flows.applicationid = $1
ORDER BY assist.flows.id
`;

const insertFlows = `
INSERT INTO assist.flows (applicationid, always_visible, keywords, deployment, external_unique_id, is_deleted, created_date, created_by, updated_date, updated_by, display_success_balloon, priority, enable_voice_over)
SELECT applicationid, always_visible, keywords, deployment, external_unique_id, is_deleted, created_date, created_by, updated_date, updated_by, display_success_balloon, priority, enable_voice_over
FROM json_populate_recordset (NULL::assist.flows, $1)
RETURNING id`;

const getFlowSteps = `
SELECT *
FROM assist.flow_steps
WHERE assist.flow_steps.flow_id IN (
    SELECT assist.flows.id
    FROM assist.flows
    WHERE assist.flows.applicationid = $1
)
ORDER BY assist.flow_steps.id, assist.flow_steps.flow_id, assist.flow_steps.index
`;

const insertFlowSteps = `
INSERT INTO assist.flow_steps (flow_id, index, uri_hashes, options, admin_metadata, screenshot_id, external_unique_id, form_id, is_deleted, created_date, created_by, updated_date, updated_by)
SELECT flow_id,index,uri_hashes,options,admin_metadata,screenshot_id,external_unique_id,form_id,is_deleted,created_date,created_by,updated_date,updated_by
FROM json_populate_recordset (NULL::assist.flow_steps, $1)
RETURNING id, options`;

const updateFlowStepsOptions = `
UPDATE assist.flow_steps
SET options = jsonb_set(options, '{decisionPoint,actions,0,bounceToStep,stepId}', $1, FALSE)
WHERE (assist.flow_steps.options->>'isDecisionPoint')::boolean is true and assist.flow_steps.id = $2
RETURNING id
`;

const getFlowTexts = `
SELECT *
FROM assist.flow_texts
WHERE assist.flow_texts.flow_id IN (
    SELECT assist.flows.id
    FROM assist.flows
    WHERE assist.flows.applicationid = $1
)
ORDER BY assist.flow_texts.flow_id
`;

const insertFlowTexts = `
INSERT INTO assist.flow_texts (flow_id, locale_id, name, description, is_deleted, created_date, created_by, updated_date, updated_by)
SELECT flow_id, locale_id, name, description, is_deleted, created_date, created_by, updated_date, updated_by
FROM json_populate_recordset (NULL::assist.flow_texts, $1)`;

const getFlowStepTexts = `
SELECT *
FROM assist.flow_step_texts
WHERE assist.flow_step_texts.flow_step_id IN (
  SELECT assist.flow_steps.id
  FROM assist.flow_steps
  WHERE assist.flow_steps.flow_id IN (
    SELECT assist.flows.id
    FROM assist.flows
    WHERE assist.flows.applicationid = $1
    )
)
ORDER BY assist.flow_step_texts.flow_step_id
`;

const insertFlowStepTexts = `
INSERT INTO assist.flow_step_texts (flow_step_id, locale_id, title, content, full_content, comments, image_id, is_deleted, created_date, created_by, updated_date, updated_by)
SELECT flow_step_id, locale_id, title, content, full_content, comments, image_id, is_deleted, created_date, created_by, updated_date, updated_by
FROM json_populate_recordset (NULL::assist.flow_step_texts, $1)`;

const getAllFlowData = `
SELECT *
FROM assist.flows
JOIN assist.flow_steps
ON assist.flows.id = assist.flow_steps.flow_id
JOIN assist.flow_texts
ON assist.flow_texts.flow_id = assist.flow_steps.flow_id
JOIN assist.flow_step_texts
ON assist.flow_step_texts.flow_step_id = assist.flow_steps.id
WHERE assist.flows.applicationid = $1
ORDER BY assist.flows.id, assist.flow_steps.flow_id, assist.flow_steps.index, assist.flow_step_texts.flow_step_id
`;

export {
	getFlows,
	insertFlows,
	getFlowSteps,
  insertFlowSteps,
  updateFlowStepsOptions,
	getFlowTexts,
	insertFlowTexts,
	getFlowStepTexts,
  insertFlowStepTexts,
	getAllFlowData,
};
