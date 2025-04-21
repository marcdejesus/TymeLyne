import axios from 'axios';
import api, { taskAPI } from '../../src/api/api';

// Mock axios
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  };
  
  return {
    create: jest.fn(() => mockAxiosInstance),
    defaults: { headers: { common: {} } }
  };
});

describe('Task API', () => {
  let mockAxiosInstance;
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockAxiosInstance = axios.create();
  });
  
  describe('getAllTasks', () => {
    it('should fetch tasks successfully', async () => {
      const mockData = [{ id: 1, title: 'Task 1' }, { id: 2, title: 'Task 2' }];
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockData });
      
      const result = await taskAPI.getAllTasks();
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/tasks/');
      expect(result).toEqual(mockData);
    });
    
    it('should handle error when fetching tasks fails', async () => {
      const error = new Error('Network error');
      mockAxiosInstance.get.mockRejectedValueOnce(error);
      
      await expect(taskAPI.getAllTasks()).rejects.toThrow('Network error');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/tasks/');
    });
  });
  
  describe('getTask', () => {
    it('should fetch a single task successfully', async () => {
      const mockData = { id: 1, title: 'Task 1' };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockData });
      
      const result = await taskAPI.getTask(1);
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/tasks/1/');
      expect(result).toEqual(mockData);
    });
    
    it('should handle error when fetching a task fails', async () => {
      const error = new Error('Task not found');
      mockAxiosInstance.get.mockRejectedValueOnce(error);
      
      await expect(taskAPI.getTask(999)).rejects.toThrow('Task not found');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/tasks/999/');
    });
  });
  
  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const newTask = { title: 'New Task', description: 'Description' };
      const mockResponse = { ...newTask, id: 3 };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await taskAPI.createTask(newTask);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/tasks/', newTask);
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle error when creating a task fails', async () => {
      const newTask = { title: '' }; // Invalid task
      const error = new Error('Validation error');
      mockAxiosInstance.post.mockRejectedValueOnce(error);
      
      await expect(taskAPI.createTask(newTask)).rejects.toThrow('Validation error');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/tasks/', newTask);
    });
  });
  
  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const taskId = 1;
      const updatedTask = { title: 'Updated Task', completed: true };
      const mockResponse = { id: 1, ...updatedTask };
      mockAxiosInstance.put.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await taskAPI.updateTask(taskId, updatedTask);
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/api/tasks/${taskId}/`, updatedTask);
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle error when updating a task fails', async () => {
      const taskId = 999; // Non-existent task
      const updatedTask = { title: 'Updated Task' };
      const error = new Error('Task not found');
      mockAxiosInstance.put.mockRejectedValueOnce(error);
      
      await expect(taskAPI.updateTask(taskId, updatedTask)).rejects.toThrow('Task not found');
      expect(mockAxiosInstance.put).toHaveBeenCalledWith(`/api/tasks/${taskId}/`, updatedTask);
    });
  });
  
  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const taskId = 1;
      const mockResponse = { success: true };
      mockAxiosInstance.delete.mockResolvedValueOnce({ data: mockResponse });
      
      const result = await taskAPI.deleteTask(taskId);
      
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/api/tasks/${taskId}/`);
      expect(result).toEqual(mockResponse);
    });
    
    it('should handle error when deleting a task fails', async () => {
      const taskId = 999; // Non-existent task
      const error = new Error('Task not found');
      mockAxiosInstance.delete.mockRejectedValueOnce(error);
      
      await expect(taskAPI.deleteTask(taskId)).rejects.toThrow('Task not found');
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(`/api/tasks/${taskId}/`);
    });
  });
}); 