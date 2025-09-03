import axios, {type AxiosInstance} from 'axios';
import type {
    ApiResponse,
    Example,
    LoginRequest,
    LoginResponse,
    PaginatedResponse,
    User,
    UserStats,
    VerbForm,
    Word,
    WordDefinition,
    Game,
    GameQuestion,
    GameAnswer
} from '../types';

const apiURL = import.meta.env.VITE_API_URL;

if (!apiURL) {
    throw new Error('API URL is not defined');
}

const api: AxiosInstance = axios.create({
    baseURL: apiURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // If token is expired, redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export const authService = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<ApiResponse<LoginResponse>>('/auth/admin/login', data);
        return response.data.data;
    },
    logout: async (): Promise<void> => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
    },
};

export const usersService = {
    getUsers: async (page = 1, limit = 10): Promise<PaginatedResponse<User>> => {
        const response = await api.get<ApiResponse<PaginatedResponse<User>>>(`/users?page=${page}&limit=${limit}`);
        return response.data.data;
    },
    getUserStats: async (): Promise<UserStats> => {
        const response = await api.get<ApiResponse<UserStats>>('/users/stats');
        return response.data.data;
    },
};

export const wordsService = {
    getWords: async (page = 1, limit = 10, search?: string) => {
        let url = `/words?page=${page}&limit=${limit}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        const response = await api.get<PaginatedResponse<Word>>(url);
        return response.data;
    },
    getWord: async (id: string): Promise<Word> => {
        const response = await api.get<Word>(`/words/single/${id}`);

        return response.data;
    },
    getWordDetails: async (word: string): Promise<Word> => {
        const response = await api.get<Word>(`/words/${word}`);
        return response.data;
    },
    createWord: async (data: Partial<Word>): Promise<Word> => {
        const response = await api.post<Word>('/words', data);
        return response.data;
    },
    updateWord: async (id: string, data: Partial<Word>): Promise<Word> => {
        const response = await api.patch<Word>(`/words/${id}`, data);
        return response.data;
    },
    deleteWord: async (id: string): Promise<void> => {
        await api.delete<void>(`/words/${id}`);
    },
    addDefinition: async (wordId: string, data: Partial<WordDefinition>): Promise<WordDefinition> => {
        // Extract only the fields that the backend expects
        const {typeEn, typeUz, meaning, plural} = data;
        const response = await api.post<WordDefinition>(`/words/${wordId}/definitions`, {
            typeEn,
            typeUz,
            meaning,
            plural
        });
        return response.data;
    },
    updateDefinition: async (wordId: string, definitionId: string, data: Partial<WordDefinition>): Promise<WordDefinition> => {
        // Extract only the fields that the backend expects
        const {typeEn, typeUz, meaning, plural} = data;
        const response = await api.patch<WordDefinition>(`/words/${wordId}/definitions/${definitionId}`, {
            typeEn,
            typeUz,
            meaning,
            plural
        });
        return response.data;
    },
    deleteDefinition: async (wordId: string, definitionId: string): Promise<void> => {
        await api.delete<void>(`/words/${wordId}/definitions/${definitionId}`);
    },
    addExample: async (wordId: string, data: Partial<Example>): Promise<Example> => {
        const response = await api.post<Example>(`/words/${wordId}/examples`, data);
        return response.data;
    },
    updateExample: async (wordId: string, exampleId: string, data: Partial<Example>): Promise<Example> => {
        const response = await api.patch<Example>(`/words/${wordId}/examples/${exampleId}`, data);
        return response.data;
    },
    deleteExample: async (wordId: string, exampleId: string): Promise<void> => {
        await api.delete<void>(`/words/${wordId}/examples/${exampleId}`);
    },
    addVerbForm: async (wordId: string, data: Partial<VerbForm>): Promise<VerbForm> => {
        const response = await api.post<VerbForm>(`/words/${wordId}/verb-forms`, data);
        return response.data;
    },
    updateVerbForm: async (wordId: string, verbFormId: string, data: Partial<VerbForm>): Promise<VerbForm> => {
        const response = await api.patch<VerbForm>(`/words/${wordId}/verb-forms/${verbFormId}`, data);
        return response.data;
    },
    deleteVerbForm: async (wordId: string, verbFormId: string): Promise<void> => {
        await api.delete<void>(`/words/${wordId}/verb-forms/${verbFormId}`);
    },
};

// Games service
export const gamesService = {
    getGames: async (page = 1, limit = 10): Promise<PaginatedResponse<Game>> => {
        const response = await api.get<PaginatedResponse<Game>>(`/games?page=${page}&limit=${limit}`);
        return response.data;
    },
    getGame: async (id: string): Promise<Game> => {
        const response = await api.get<Game>(`/games/${id}`);
        return response.data;
    },
    createGame: async (data: Partial<Game>): Promise<Game> => {
        const response = await api.post<Game>('/games', data);
        return response.data;
    },
    updateGame: async (id: string, data: Partial<Game>): Promise<Game> => {
        const response = await api.patch<Game>(`/games/${id}`, data);
        return response.data;
    },
    deleteGame: async (id: string): Promise<void> => {
        await api.delete<void>(`/games/${id}`);
    },
    // questions
    addQuestion: async (gameId: string, data: Partial<GameQuestion>): Promise<GameQuestion> => {
        const response = await api.post<GameQuestion>(`/games/${gameId}/questions`, data);
        return response.data;
    },
    updateQuestion: async (questionId: string, data: Partial<GameQuestion>): Promise<GameQuestion> => {
        const response = await api.patch<GameQuestion>(`/games/questions/${questionId}`, data);
        return response.data;
    },
    deleteQuestion: async (questionId: string): Promise<void> => {
        await api.delete<void>(`/games/questions/${questionId}`);
    },
    // answers
    addAnswer: async (questionId: string, data: Partial<GameAnswer>): Promise<GameAnswer> => {
        const response = await api.post<GameAnswer>(`/games/questions/${questionId}/answers`, data);
        return response.data;
    },
    updateAnswer: async (answerId: string, data: Partial<GameAnswer>): Promise<GameAnswer> => {
        const response = await api.patch<GameAnswer>(`/games/answers/${answerId}`, data);
        return response.data;
    },
    deleteAnswer: async (answerId: string): Promise<void> => {
        await api.delete<void>(`/games/answers/${answerId}`);
    },
};

// Comments service
export const commentsService = {
    getComments: async (page = 1, limit = 10, search?: string) => {
        let url = `/comments?page=${page}&limit=${limit}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        const response = await api.get<ApiResponse<PaginatedResponse<Comment>>>(url);
        return response.data.data;
    },
    updateComment: async (id: string, data: Partial<Comment>) => {
        const response = await api.patch<ApiResponse<Comment>>(`/comments/${id}`, data);
        return response.data.data;
    },
    deleteComment: async (id: string) => {
        const response = await api.delete<ApiResponse<{ id: string }>>(`/comments/${id}`);
        return response.data.data;
    },
};

// Export the api instance
export default api;
