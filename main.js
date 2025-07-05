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
            throw error;
        }

        return data || [];
    } catch (error) {
        console.error('Error in getAllProducts:', error);
        throw error;
    }
}

async function getProductById(id) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error('Error fetching product:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error in getProductById:', error);
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
            throw allError;
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

// Main Product App Class
class ProductApp {
    constructor() {
        this.products = [];
        this.selectedProduct = null;
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadProducts();
    }

    bindEvents() {
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal'));
            });
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

    async loadProducts() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();
        
        try {
            this.products = await getAllProducts();
            
            if (this.products.length === 0) {
                this.showError();
            } else {
                this.renderProducts();
                await this.updateProductCount();
            }
        } catch (error) {
            console.error('Error loading products:', error);
            this.showError('Failed to load products. Please check your connection and try again.');
        } finally {
            this.hideLoading();
            this.isLoading = false;
        }
    }

    async updateProductCount() {
        try {
            const stats = await getProductStats();
            const countElement = document.querySelector('.product-count');
            countElement.textContent = `${stats.available} products available`;
        } catch (error) {
            console.error('Error updating product count:', error);
            const countElement = document.querySelector('.product-count');
            countElement.textContent = 'Products available';
        }
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
        document.getElementById('product-grid').classList.add('hidden');
        document.getElementById('error').classList.add('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showError(message = 'We\'re currently updating our product catalog. Please check back soon!') {
        const errorElement = document.getElementById('error');
        const errorMessage = errorElement.querySelector('p');
        errorMessage.textContent = message;
        
        errorElement.classList.remove('hidden');
        document.getElementById('product-grid').classList.add('hidden');
    }

    renderProducts() {
        const grid = document.getElementById('product-grid');
        grid.innerHTML = '';
        grid.classList.remove('hidden');
        document.getElementById('error').classList.add('hidden');

        this.products.forEach(product => {
            const productCard = this.createProductCard(product);
            grid.appendChild(productCard);
        });
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `View details for ${product.name}`);

        const stockClass = product.stock === 0 ? 'out' : product.stock < 5 ? 'low' : '';
        const stockText = product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`;

        const imageUrl = product.image_url || this.getPlaceholderImage();

        card.innerHTML = `
            <img src="${imageUrl}" alt="${this.escapeHtml(product.name)}" class="product-image" 
                 onerror="this.src='${this.getPlaceholderImage()}'">
            <div class="product-info">
                <h3 class="product-name">${this.escapeHtml(product.name)}</h3>
                <p class="product-description">${this.escapeHtml(product.description)}</p>
                <div class="product-meta">
                    <span class="product-price">£${parseFloat(product.price).toFixed(2)}</span>
                    <div class="product-stock">
                        <span class="stock-indicator ${stockClass}"></span>
                        <span>${stockText}</span>
                    </div>
                </div>
            </div>
        `;

        const handleCardClick = () => {
            this.showProductDetail(product);
        };

        card.addEventListener('click', handleCardClick);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick();
            }
        });

        return card;
    }

    async showProductDetail(product) {
        this.selectedProduct = product;
        const modal = document.getElementById('product-detail');
        const content = document.getElementById('product-detail-content');

        content.innerHTML = `
            <div class="product-detail-loading">
                <div class="spinner"></div>
                <p>Loading product details...</p>
            </div>
        `;

        this.showModal(modal);

        try {
            const freshProduct = await getProductById(product.id);
            
            if (!freshProduct) {
                content.innerHTML = `
                    <div class="product-detail-error">
                        <h2>Product Not Found</h2>
                        <p>This product is no longer available.</p>
                        <button class="btn btn-secondary" onclick="app.closeModal(document.getElementById('product-detail'))">
                            ← Back to Products
                        </button>
                    </div>
                `;
                return;
            }

            this.renderProductDetail(freshProduct, content);
        } catch (error) {
            console.error('Error loading product details:', error);
            content.innerHTML = `
                <div class="product-detail-error">
                    <h2>Error Loading Product</h2>
                    <p>Unable to load product details. Please try again.</p>
                    <button class="btn btn-secondary" onclick="app.closeModal(document.getElementById('product-detail'))">
                        ← Back to Products
                        </button>
                </div>
            `;
        }
    }

    renderProductDetail(product, content) {
        const stockClass = product.stock === 0 ? 'out' : product.stock < 5 ? 'low' : '';
        const stockText = product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`;
        const imageUrl = product.image_url || this.getPlaceholderImage();

        content.innerHTML = `
            <div class="product-detail">
                <div class="product-detail-image">
                    <img src="${imageUrl}" alt="${this.escapeHtml(product.name)}"
                         onerror="this.src='${this.getPlaceholderImage()}'">
                </div>
                <div class="product-detail-info">
                    <h2 class="product-detail-name">${this.escapeHtml(product.name)}</h2>
                    <p class="product-detail-description">${this.escapeHtml(product.description)}</p>
                    <div class="product-detail-meta">
                        <div class="product-detail-price">£${parseFloat(product.price).toFixed(2)}</div>
                        <div class="product-detail-stock">
                            <span class="stock-indicator ${stockClass}"></span>
                            <span>${stockText}</span>
                        </div>
                    </div>
                    <button class="btn btn-secondary back-button" onclick="app.closeModal(document.getElementById('product-detail'))">
                        ← Back to Products
                    </button>
                </div>
            </div>
        `;
    }

    showModal(modal) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        const firstFocusableElement = modal.querySelector('button, input, textarea, select');
        if (firstFocusableElement) {
            firstFocusableElement.focus();
        }
    }

    closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getPlaceholderImage() {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMzAgNzVIMTcwVjEyNUgxMzBWNzVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xNDAgODVIMTUwVjk1SDE0MFY4NVoiIGZpbGw9IiNGM0Y0RjYiLz4KPHBhdGggZD0iTTE0MCA5NUgxNjBWMTE1SDE0MFY5NVoiIGZpbGw9IiNGM0Y0RjYiLz4KPHRleHQgeD0iMTUwIiB5PSIxNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Q0EzQUYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+SW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
    }

    async refreshProducts() {
        await this.loadProducts();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ProductApp();
});

// Make app globally available for button onclick handlers
window.app = window.app || {};