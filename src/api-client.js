const API_BASE_URL = typeof(apiUrl) !== 'undefined' && apiUrl ? apiUrl : 'http://localhost:3000/api';

class ArtitalkAPI {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('artitalk_token');
        this.currentUser = null;
        this._loadUser();
    }

    _loadUser() {
        const userData = localStorage.getItem('artitalk_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    }

    _saveUser(user, token) {
        this.currentUser = user;
        this.token = token;
        localStorage.setItem('artitalk_user', JSON.stringify(user));
        localStorage.setItem('artitalk_token', token);
    }

    _clearUser() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('artitalk_user');
        localStorage.removeItem('artitalk_token');
    }

    async _request(url, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${this.baseURL}${url}`, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }

        return data;
    }

    async register(username, password, img, imgToken) {
        const data = await this._request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, img, imgToken })
        });
        this._saveUser(data.user, data.token);
        return data;
    }

    async login(username, password) {
        const data = await this._request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        this._saveUser(data.user, data.token);
        return data;
    }

    logout() {
        this._clearUser();
        return Promise.resolve();
    }

    getCurrentUser() {
        return this.currentUser;
    }

    async getMe() {
        const data = await this._request('/auth/me');
        return data;
    }

    async getShuoshuoList(page = 0, pageSize = 5) {
        return await this._request(`/shuoshuo?page=${page}&pageSize=${pageSize}`);
    }

    async createShuoshuo(content) {
        return await this._request('/shuoshuo', {
            method: 'POST',
            body: JSON.stringify(content)
        });
    }

    async getShuoshuo(id) {
        return await this._request(`/shuoshuo/${id}`);
    }

    async updateShuoshuo(id, content) {
        return await this._request(`/shuoshuo/${id}`, {
            method: 'PUT',
            body: JSON.stringify(content)
        });
    }

    async deleteShuoshuo(id) {
        return await this._request(`/shuoshuo/${id}`, {
            method: 'DELETE'
        });
    }

    async getComments(atId) {
        return await this._request(`/comments/${atId}`);
    }

    async createComment(comment) {
        return await this._request('/comments', {
            method: 'POST',
            body: JSON.stringify(comment)
        });
    }

    async getCommentCount(atId) {
        const data = await this._request(`/comments/count/${atId}`);
        return data.count;
    }
}

const atAPI = new ArtitalkAPI();

if (typeof window !== 'undefined') {
    window.atAPI = atAPI;
}
