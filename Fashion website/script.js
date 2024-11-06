document.addEventListener('DOMContentLoaded', async () => {
    const categoryFilters = document.querySelectorAll('.category-filter');
    const colorFilters = document.querySelectorAll('.color-filter');
    const sizeFilters = document.querySelectorAll('.size-filter');
    const productGrid = document.getElementById('productGrid');
    const activeFiltersContainer = document.getElementById('activeFilters');
    const clearFiltersButton = document.getElementById('clearFilters');

    let activeFilters = {
        category: new Set(),
        color: new Set(),
        size: new Set(),
    };

    // Web3.js related variables
    let web3;
    let accounts;

    // Check if Web3 is injected by the browser (e.g., MetaMask)
    async function connectWeb3() {
        if (window.ethereum) {
            web3 = new Web3(window.ethereum);
            try {
                accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                alert("Wallet connected: " + accounts[0]);
            } catch (error) {
                console.error("User denied wallet connection");
            }
        } else {
            alert("Please install MetaMask or another Web3 provider.");
        }
    }

    // Add to cart transaction (example transaction)
    async function addToCartTransaction(productId) {
        if (!web3) {
            alert("Please connect your wallet first.");
            return;
        }

        const transactionParameters = {
            to: accounts[0], // Sending transaction to the user's own account
            from: accounts[0], // The connected wallet address
            value: '0', // Value in Wei (set to 0 for testing without actual transfer)
            data: web3.utils.asciiToHex(`Added product ${productId} to cart`),
        };

        try {
            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });
            alert("Transaction successful with hash: " + txHash);
        } catch (error) {
            console.error("Transaction failed", error);
        }
    }

    // Connect wallet button
    const connectWalletButton = document.createElement('button');
    connectWalletButton.textContent = "Connect Wallet";
    connectWalletButton.classList.add('connect-wallet');
    connectWalletButton.addEventListener('click', connectWeb3);
    document.body.insertBefore(connectWalletButton, productGrid);

    // Adding transaction to Add to Cart button
    document.querySelectorAll('.add-to-cart').forEach((button, index) => {
        button.addEventListener('click', () => {
            const productId = `Product-${index + 1}`;
            addToCartTransaction(productId);
        });
    });

    // Filtering functionality
    [...categoryFilters, ...colorFilters, ...sizeFilters].forEach((filter) => {
        filter.addEventListener('change', () => {
            updateActiveFilters(filter);
            applyFilters();
            displayActiveFilters();
        });
    });

    function updateActiveFilters(filter) {
        const filterType = filter.classList.contains('category-filter') ? 'category' :
            filter.classList.contains('color-filter') ? 'color' : 'size';

        if (filter.checked) {
            activeFilters[filterType].add(filter.value);
        } else {
            activeFilters[filterType].delete(filter.value);
        }
    }

    function applyFilters() {
        const products = productGrid.querySelectorAll('.product-card');
        products.forEach(product => {
            const category = product.getAttribute('data-category');
            const color = product.getAttribute('data-color');
            const size = product.getAttribute('data-size');

            const matchesCategory = activeFilters.category.size === 0 || activeFilters.category.has(category);
            const matchesColor = activeFilters.color.size === 0 || activeFilters.color.has(color);
            const matchesSize = activeFilters.size.size === 0 || activeFilters.size.has(size);

            if (matchesCategory && matchesColor && matchesSize) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    }

    function displayActiveFilters() {
        activeFiltersContainer.innerHTML = '';

        Object.keys(activeFilters).forEach(filterType => {
            activeFilters[filterType].forEach(value => {
                const filterTag = document.createElement('div');
                filterTag.classList.add('filter-tag');
                filterTag.textContent = value;

                const removeButton = document.createElement('button');
                removeButton.textContent = 'x';
                removeButton.classList.add('remove-filter');
                removeButton.addEventListener('click', () => {
                    removeFilter(filterType, value);
                });

                filterTag.appendChild(removeButton);
                activeFiltersContainer.appendChild(filterTag);
            });
        });

        clearFiltersButton.style.display = (activeFilters.category.size || activeFilters.color.size || activeFilters.size.size) ? 'block' : 'none';
    }

    function removeFilter(filterType, value) {
        activeFilters[filterType].delete(value);
        document.querySelector(`input.${filterType}-filter[value="${value}"]`).checked = false;
        applyFilters();
        displayActiveFilters();
    }

    clearFiltersButton.addEventListener('click', () => {
        clearAllFilters();
        applyFilters();
        displayActiveFilters();
    });

    function clearAllFilters() {
        activeFilters = {
            category: new Set(),
            color: new Set(),
            size: new Set(),
        };
        [...categoryFilters, ...colorFilters, ...sizeFilters].forEach(filter => filter.checked = false);
    }

    applyFilters();
    displayActiveFilters();
});
