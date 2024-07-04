import url from "./url";
import env from "../../../../build/env";
import request from "./http";

const baseUrl = url[env].aiUrl;
// const baseUrl = url.newDevelopment.aiUrl;
// const devUrl = 'http://192.168.77.193:9965' //  for local test
// const devUrl = 'http://10.0.51.241:9965'
// const devUrl = "http://192.168.77.86:9965";

export const queryScenarioList = (data) => {
  return request(`${baseUrl}/ai-scenario-service/scenario/queryScenarioList`, {
    ...data,
  });
};

export const queryGroupList = async (data) => {
  return request(
    `${baseUrl}/ai-scenario-service/scenario/queryGroupList`,
    data
  );
};

export const queryToolbarTriggerConfig = (data) => {
  return request(
    `${baseUrl}/ai-scenario-service/aiToolbar/queryToolbarTriggerConfig`,
    { ...data }
  );
};

export const setToolbarTriggerConfig = (data) => {
  return request(
    `${baseUrl}/ai-scenario-service/aiToolbar/setToolbarTriggerConfig`,
    { ...data }
  );
};

export const queryToolbarScenarioConfig = (data) => {
  const { orgId, userId, triggerType, stage } = data;
  return request(
    `${baseUrl}/ai-scenario-service/aiToolbar/queryToolbarScenarioConfig`,
    data,
    {
      isCache: true,
      cacheKey: `${orgId}${userId}${triggerType}${stage}`,
      cacheTime: 5 * 60 * 1000,
    }
  );
};

export const sortGroupInToolbar = (data) => {
  return request(
    `${baseUrl}/ai-scenario-service/aiToolbar/sortGroupInToolbar`,
    data
  );
};

export const sortScenarioInToolbar = (data) => {
  return request(
    `${baseUrl}/ai-scenario-service/aiToolbar/sortScenarioInToolbar`,
    data
  );
};

export const setToolbarScenarioConfig = (data) => {
  return request(
    `${baseUrl}/ai-scenario-service/aiToolbar/setToolbarScenarioConfig`,
    { ...data }
  );
};

export const deleteToolbarScenarioConfig = (data) => {
  return request(
    `${baseUrl}/ai-scenario-service/aiToolbar/deleteToolbarScenarioConfig`,
    { ...data }
  );
};

export const saveToolbarScenarioConfig = (data) => {
  return request(
    `${baseUrl}/ai-scenario-service/aiToolbar/saveToolbarScenarioConfig`,
    { ...data }
  );
};

export const addNewGenerateScenario = (data) => {
  return request(
    `${baseUrl}/ai-scenario-service/aiGenerate/addNewGenerateScenario`,
    { ...data }
  );
};

export const generateNewContent = (data) => {
  return request(
    `${baseUrl}/ai-scenario-service/aiGenerate/generateNewContent`,
    { ...data }
  );
};

export const updateFeedback = (data) => {
  return request(`${baseUrl}/ai-scenario-service/history/updateFeedback`, {
    ...data,
  });
};

export const addChat = (data) => {
  return request(`${baseUrl}/ai-scenario-service/aiChat/addChat`, data);
};

export const removeChat = (data) => {
  return request(`${baseUrl}/ai-scenario-service/aiChat/removeChat`, data);
};

export const triggerChat = (data) => {
  return request(`${baseUrl}/ai-scenario-service/aiChat/triggerChat`, data);
};

export const queryChunks = (data) => {
  return request(`${baseUrl}/ai-scenario-service/reference/queryChunks`, data);
};

export const queryKeywords = (data) => {
  return request(
    `${baseUrl}/ai-scenario-service/reference/queryKeywords`,
    data
  );
};

export const feedbackOnReference = (data) => {
  return request(
    `${baseUrl}/ai-scenario-service/reference/feedbackOnReference`,
    data
  );
};
