import url from './url'
import env from '../../../../build/env'
import request from './http'

const baseUrl = url[env].aiUrl
// const baseUrl = url.newDevelopment.aiUrl

export const getChatSet = (data) => {
  return request(`${baseUrl}/ai-scenario-service/aiChat/queryChatConfig`, data)
}

export const saveChatSettings = (data) => {
  return request(`${baseUrl}/ai-scenario-service/aiChat/updateChatConfig`, data)
}

export const getFolderList = (data) => {
  return request(`${baseUrl}/ai-knowledge-warehouse/folder/queryFolders`, data)
}

export const moveFolder = (data) => {
  return request(`${baseUrl}/ai-knowledge-warehouse/folder/moveFolder`, data)
}

export const newFolder = (data) => {
  return request(`${baseUrl}/ai-knowledge-warehouse/folder/createFolder`, data)
}

export const editFolder = (data) => {
  return request(`${baseUrl}/ai-knowledge-warehouse/folder/updateFolder`, data)
}

export const deleteFolder = (data) => {
  return request(`${baseUrl}/ai-knowledge-warehouse/folder/deleteFolder`, data)
}

export const getTagTableData = (data) => {
  return request(`${baseUrl}/ai-knowledge-warehouse/tag/queryTagList`, data)
}
