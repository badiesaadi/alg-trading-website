// Supabase configuration
const supabaseUrl = 'https://rbdjierclsiuvprvrzie.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJiZGppZXJjbHNpdXZwcnZyemllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjgwNjUsImV4cCI6MjA2NzMwNDA2NX0.E69edaH7d8w_bJq4iQlK7fQGvSaEOxgjdTqBE964O1Y';

// Create Supabase client
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// Product Service Functions
async function getAllProducts() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            throw new Error(`Failed to fetch products: ${error.message}`);
        }

        return data || [];
    } catch (error) {
        console.error('Error in getAllProducts:', error);
        throw error;
    }
}

async function getProductStats() {
    try {
        const { data: allProducts, error: allError } = await supabase
            .from('products')
            .select('stock');

        if (allError) {
            console.error('Error fetching product stats:', allError);
            throw new Error(`Failed to fetch stats: ${allError.message}`);
        }

        const total = allProducts.length;
        const available = allProducts.filter(p => p.stock > 0).length;
        const outOfStock = allProducts.filter(p => p.stock === 0).length;

        return {
            total,
            available,
            out_of_stock: outOfStock
        };
    } catch (error) {
        console.error('Error in getProductStats:', error);
        throw error;
    }
}

async function addProduct(productData) {
    try {
        const { data, error } = await supabase
            .from('products')
            .insert([productData])
            .select()
            .single();

        if (error) {
            console.error('Error adding product:', error);
            throw new Error(`Failed to add product: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error('Error in addProduct:', error);
        throw error;
    }
}

async function updateProduct(id, updates) {
    try {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating product:', error);
            throw new Error(`Failed to update product: ${error.message}`);
        }

        return data;
    } catch (error) {
        console.error('Error in updateProduct:', error);
        throw error;
    }
}

async function deleteProduct(id) {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting product:', error);
            throw new Error(`Failed to delete product: ${error.message}`);
        }

        return true;
    } catch (error) {
        console.error('Error in deleteProduct:', error);
        throw error;
    }
}

async function uploadImage(file) {
    try {
        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            throw new Error('Only JPEG, PNG, and GIF images are allowed.');
        }

        // Generate a unique file name
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        // Check authentication state
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.error('Session check error:', sessionError);
            throw new Error(`Failed to check authentication: ${sessionError.message}`);
        }
        if (!session) {
            throw new Error('User is not authenticated. Please log in again.');
        }

        // Upload file to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Upload error details:', uploadError);
            if (uploadError.message.includes('Bucket not found')) {
                throw new Error('Image upload failed: The product-images bucket does not exist. Please create it in Supabase.');
            }
            throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

        if (!publicUrl) {
            throw new Error('Failed to retrieve public URL for the uploaded image.');
        }

        return publicUrl;
    } catch (error) {
        console.error('Error in uploadImage:', error);
        throw error;
    }
}

class AdminApp {
    constructor() {
        this.currentUser = null;
        this.products = [];
        this.editingProduct = null;
        this.deletingProductId = null;
        
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.checkAuthState();
    }

    bindEvents() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Add product button
        document.getElementById('add-product-btn').addEventListener('click', () => {
            this.showAddProductModal();
        });

        // Product form
        document.getElementById('product-form').addEventListener('submit', (e) => {
            this.handleProductSubmit(e);
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
        });

        // Cancel buttons
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.closeModal(document.getElementById('product-modal'));
        });

        document.getElementById('cancel-delete-btn').addEventListener('click', () => {
            this.closeModal(document.getElementById('delete-modal'));
        });

        // Confirm delete button
        document.getElementById('confirm-delete-btn').addEventListener('click', () => {
            this.confirmDelete();
        });

        // Image preview
        document.getElementById('product-image').addEventListener('change', (e) => {
            const file = e.target.files[0];
            const preview = document.getElementById('image-preview');
            preview.innerHTML = '';
            
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    this.closeModal(openModal);
                }
            }
        });
    }

    async checkAuthState() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error('Error checking session:', error);
                throw new Error(`Failed to check session: ${error.message}`);
            }
            console.log('Auth session:', session);
            
            if (session) {
                this.currentUser = session.user;
                this.showAdminDashboard();
                await this.loadDashboardData();
            } else {
                console.log('No active session, showing login form');
                this.showLoginForm();
            }
        } catch (error) {
            console.error('Error in checkAuthState:', error);
            this.showLoginForm();
            let errorMessage = 'Error checking authentication. Please try logging in.';
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Unable to connect to the server. Please check your internet connection or Supabase URL.';
            }
            document.getElementById('login-error').textContent = errorMessage;
            document.getElementById('login-error').classList.remove('hidden');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('email').trim();
        const password = formData.get('password');
        
        const errorElement = document.getElementById('login-error');
        errorElement.classList.add('hidden');
        
        // Basic input validation
        if (!email || !password) {
            errorElement.textContent = 'Email and password are required.';
            errorElement.classList.remove('hidden');
            return;
        }
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                throw new Error(`Login failed: ${error.message}`);
            }
            
            this.currentUser = data.user;
            this.showAdminDashboard();
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = error.message || 'Login failed. Please check your credentials.';
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Unable to connect to the server. Please check your internet connection or Supabase URL.';
            } else if (error.message.includes('Invalid login credentials')) {
                errorMessage = 'Incorrect email or password. Please try again.';
            }
            errorElement.textContent = errorMessage;
            errorElement.classList.remove('hidden');
        }
    }

    async handleLogout() {
        try {
            await supabase.auth.signOut();
            this.currentUser = null;
            this.showLoginForm();
        } catch (error) {
            console.error('Logout error:', error);
            document.getElementById('login-error').textContent = 'Error logging out. Please try again.';
            document.getElementById('login-error').classList.remove('hidden');
        }
    }

    showLoginForm() {
        document.getElementById('login-section').classList.remove('hidden');
        document.getElementById('admin-section').classList.add('hidden');
        
        // Clear form
        document.getElementById('login-form').reset();
        document.getElementById('login-error').classList.add('hidden');
    }

    showAdminDashboard() {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('admin-section').classList.remove('hidden');
    }

    async loadDashboardData() {
        this.showLoading();
        
        try {
            // Load stats and products in parallel
            const [stats, products] = await Promise.all([
                getProductStats(),
                getAllProducts()
            ]);
            
            this.updateStats(stats);
            this.products = products;
            this.renderProductsTable();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            let errorMessage = error.message || 'Error loading products. Please try again.';
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Unable to connect to the server. Please check your internet connection or Supabase URL.';
            }
            document.getElementById('products-tbody').innerHTML = `
                <tr>
                    <td colspan="5" class="text-center" style="padding: 2rem;">
                        ${errorMessage}
                    </td>
                </tr>
            `;
        } finally {
            this.hideLoading();
        }
    }

    updateStats(stats) {
        document.getElementById('total-products').textContent = stats.total;
        document.getElementById('available-products').textContent = stats.available;
        document.getElementById('out-of-stock').textContent = stats.out_of_stock;
    }

    renderProductsTable() {
        const tbody = document.getElementById('products-tbody');
        tbody.innerHTML = '';
        
        if (this.products.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center" style="padding: 2rem;">
                        No products found. Add your first product to get started.
                    </td>
                </tr>
            `;
            return;
        }
        
        this.products.forEach(product => {
            const row = this.createProductRow(product);
            tbody.appendChild(row);
        });
    }

    createProductRow(product) {
        const row = document.createElement('tr');
        
        const stockClass = product.stock === 0 ? 'out' : product.stock < 5 ? 'low' : '';
        const stockText = product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`;
        const imageUrl = product.image_url || this.getPlaceholderImage();
        
        row.innerHTML = `
            <td class="product-image-cell">
                <img src="${imageUrl}" alt="${this.escapeHtml(product.name)}" 
                     class="product-image-small" 
                     onerror="this.src='${this.getPlaceholderImage()}'">
            </td>
            <td class="product-name-cell">${this.escapeHtml(product.name)}</td>
            <td class="product-price-cell">£${parseFloat(product.price).toFixed(2)}</td>
            <td>
                <div class="stock-cell">
                    <span class="stock-indicator ${stockClass}"></span>
                    <span>${stockText}</span>
                </div>
            </td>
            <td class="actions-cell">
                <button class="btn btn-small btn-secondary edit-btn" data-id="${product.id}">
                    Edit
                </button>
                <button class="btn btn-small btn-danger delete-btn" data-id="${product.id}">
                    Delete
                </button>
            </td>
        `;
        
        // Add event listeners
        row.querySelector('.edit-btn').addEventListener('click', () => {
            this.showEditProductModal(product);
        });
        
        row.querySelector('.delete-btn').addEventListener('click', () => {
            this.showDeleteModal(product.id);
        });
        
        return row;
    }

    showAddProductModal() {
        this.editingProduct = null;
        document.getElementById('modal-title').textContent = 'Add New Product';
        document.getElementById('save-btn').textContent = 'Add Product';
        document.getElementById('product-form').reset();
        document.getElementById('image-preview').innerHTML = '';
        document.getElementById('product-error').classList.add('hidden');
        this.showModal(document.getElementById('product-modal'));
    }

    showEditProductModal(product) {
        this.editingProduct = product;
        document.getElementById('modal-title').textContent = 'Edit Product';
        document.getElementById('save-btn').textContent = 'Update Product';
        
        // Populate form
        document.getElementById('product-name').value = product.name || '';
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-price').value = product.price || 0;
        document.getElementById('product-stock').value = product.stock || 0;
        document.getElementById('product-image').value = '';
        document.getElementById('image-preview').innerHTML = product.image_url 
            ? `<img src="${product.image_url}" alt="Current product image">`
            : '';
        document.getElementById('product-error').classList.add('hidden');
        
        this.showModal(document.getElementById('product-modal'));
    }

    async handleProductSubmit(e) {
        e.preventDefault();
        
        const errorElement = document.getElementById('product-error');
        errorElement.classList.add('hidden');
        
        const formData = new FormData(e.target);
        const name = formData.get('name').trim();
        const description = formData.get('description').trim();
        const price = parseFloat(formData.get('price'));
        const stock = parseInt(formData.get('stock'));
        const imageFile = formData.get('image');
        
        // Validate form inputs
        if (!name) {
            errorElement.textContent = 'Product name is required.';
            errorElement.classList.remove('hidden');
            return;
        }
        if (!description) {
            errorElement.textContent = 'Description is required.';
            errorElement.classList.remove('hidden');
            return;
        }
        if (isNaN(price) || price < 0) {
            errorElement.textContent = 'Price must be a valid number greater than or equal to 0.';
            errorElement.classList.remove('hidden');
            return;
        }
        if (isNaN(stock) || stock < 0) {
            errorElement.textContent = 'Stock must be a valid number greater than or equal to 0.';
            errorElement.classList.remove('hidden');
            return;
        }
        
        const productData = {
            name,
            description,
            price,
            stock,
            image_url: this.editingProduct ? this.editingProduct.image_url : null
        };
        
        // Check authentication
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
            console.error('Session check error:', sessionError);
            errorElement.textContent = 'Error checking authentication. Please try logging in again.';
            errorElement.classList.remove('hidden');
            this.handleLogout();
            return;
        }
        if (!session) {
            errorElement.textContent = 'Session expired. Please log in again.';
            errorElement.classList.remove('hidden');
            this.handleLogout();
            return;
        }
        
        // Handle image upload (optional)
        if (imageFile && imageFile.size > 0) {
            if (imageFile.size > 5 * 1024 * 1024) {
                errorElement.textContent = 'Image size must be less than 5MB.';
                errorElement.classList.remove('hidden');
                return;
            }
            try {
                productData.image_url = await uploadImage(imageFile);
            } catch (error) {
                console.error('Image upload error:', error);
                errorElement.textContent = error.message || 'Error uploading image. Please try again.';
                errorElement.classList.remove('hidden');
                return;
            }
        }
        
        try {
            if (this.editingProduct) {
                await updateProduct(this.editingProduct.id, productData);
            } else {
                await addProduct(productData);
            }
            
            this.closeModal(document.getElementById('product-modal'));
            await this.loadDashboardData();
            
        } catch (error) {
            console.error('Product save error:', error);
            let errorMessage = error.message || 'Error saving product. Please try again.';
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Unable to connect to the server. Please check your internet connection or Supabase URL.';
            }
            errorElement.textContent = errorMessage;
            errorElement.classList.remove('hidden');
        }
    }

    showDeleteModal(productId) {
        this.deletingProductId = productId;
        this.showModal(document.getElementById('delete-modal'));
    }

    async confirmDelete() {
        if (!this.deletingProductId) return;
        
        try {
            await deleteProduct(this.deletingProductId);
            this.closeModal(document.getElementById('delete-modal'));
            await this.loadDashboardData();
            this.deletingProductId = null;
            
        } catch (error) {
            console.error('Error deleting product:', error);
            let errorMessage = error.message || 'Error deleting product. Please try again.';
            if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Unable to connect to the server. Please check your internet connection or Supabase URL.';
            }
            document.getElementById('product-error').textContent = errorMessage;
            document.getElementById('product-error').classList.remove('hidden');
        }
    }

    showModal(modal) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Focus management
        const firstInput = modal.querySelector('input, textarea, button');
        if (firstInput) {
            firstInput.focus();
        }
    }

    closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('products-table-container').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('products-table-container').classList.remove('hidden');
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getPlaceholderImage() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzAgNzVIMTcwVjEyNUgxMzBWNzVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xNDAgODVIMTUwVjk1SDE0MFY4NVoiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTE0MCA5NUgxNjBWMTE1SDE0MFY5NVoiIGZpbGw9IiNGM0Y0RjYiLz4KPHRleHQgeD0iMTUwIiB5PSIxNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+SW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
    }
}

// Initialize the admin app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminApp = new AdminApp();
});

// Make adminApp globally available for debugging
window.adminApp = window.adminApp || {};