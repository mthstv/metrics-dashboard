const API = 'http://localhost:3000'

export const getChurnRate = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('options', JSON.stringify({}))
  return fetch(`${API}/churn-rate`, {
    method: 'POST',
    body: formData
  }).then((response) => response.json())
}

export const getRecurringRevenue = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('options', JSON.stringify({}))
  return fetch(`${API}/recurring-revenue`, {
    method: 'POST',
    body: formData
  }).then((response) => response.json())
}
