import { useState, useEffect } from 'react'
import { ProductList } from './Components/ProductList'
import itemList from './Assets/random_products_175.json';
import './e-commerce-stylesheet.css'

type Product = {
  id: number
  name: string
  price: number
  category: string
  quantity: number
  rating: number
  image_link: string
}

// Shopping Basket
type BasketItem = {
  product: Product;
  quantity: number;
}

function App() {
  const [searchTerm, setSearchTerm] = useState<string>(''); // Search term
  const [searchedProducts, setSearchedProducts] = useState<Product[]>(itemList); // Searched products
  const [sortOption, setSortOption] = useState<string>('AtoZ'); // Sort option
  const [showInStockOnly, setShowInStockOnly] = useState<boolean>(false); // Show in stock only
  const [basketItems, setBasketItems] = useState<BasketItem[]>([]); // Shopping basket items

  // ===== Hooks =====
  useEffect(() => updateSearchedProducts(), [searchTerm, sortOption, showInStockOnly]);

  // ===== Basket management =====
  function showBasket(){
    let areaObject = document.getElementById('shopping-area');
    if(areaObject !== null){
      areaObject.style.display='block';
    }
  }

  function hideBasket(){
    let areaObject = document.getElementById('shopping-area');
    if(areaObject !== null){
      areaObject.style.display='none';
    }
  }

  // ===== Add to basket =====
  function addToBasket(productToAdd: Product) {
    setBasketItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === productToAdd.id);
      if (existingItem) {
        // If the product already exists, increase the quantity
        return prevItems.map(item => 
          item.product.id === productToAdd.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // If the product does not exist, add to the basket, quantity is 1
        return [...prevItems, { product: productToAdd, quantity: 1 }];
      }
    });
  }

  // ===== Remove from basket =====
  function removeFromBasket(productIdToRemove: number) {
    setBasketItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === productIdToRemove);
      if (existingItem && existingItem.quantity > 1) {
        // If the quantity is greater than 1, reduce the quantity
        return prevItems.map(item => 
          item.product.id === productIdToRemove 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } else {
        // If the quantity is 1 or does not exist, remove the product from the basket
        return prevItems.filter(item => item.product.id !== productIdToRemove);
      }
    });
  }

  // ===== Calculate the total cost of the basket =====
  const totalBasketCost = basketItems.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  // ===== Search =====
  function updateSearchedProducts(){
    // First filter the products based on the search term
    let filteredProducts = itemList.filter((product: Product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // If "Show in stock only" is checked, filter out products with a quantity of 0
    if (showInStockOnly) {
      filteredProducts = filteredProducts.filter((product: Product) => product.quantity > 0);
    }
    
    // Sort the products based on the selected option
    switch(sortOption) {
      case 'AtoZ':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'ZtoA':
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case '£LtoH':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case '£HtoL':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case '*LtoH':
        filteredProducts.sort((a, b) => a.rating - b.rating);
        break;
      case '*HtoL':
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      default:
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    setSearchedProducts(filteredProducts);
  }

  // ===== Results Indicator Text =====
  const getResultsText = () => {
    const count = searchedProducts.length;
    
    if (searchTerm === '') {
      return count === 1 ? '1 Product' : `${count} Products`;
    } else {
      if (count === 0) return 'No search results found';
      return count === 1 ? '1 Result' : `${count} Results`;
    }
  }

  return (
    <div id="container"> 
      <div id="logo-bar">
        <div id="logo-area">
          <img src="./src/assets/logo.png"></img>
        </div>
        <div id="shopping-icon-area">
          <img id="shopping-icon" onClick={showBasket} src="./src/assets/shopping-basket.png"></img>
        </div>
        <div id="shopping-area">
          <div id="exit-area">
            <p id="exit-icon" onClick={hideBasket}>x</p>
          </div>
          {/* Display content based on the shopping basket status */}
          {basketItems.length === 0 ? (
            <p>Your basket is empty</p>
          ) : (
            <>
              {basketItems.map(item => (
                <div key={item.product.id} className="shopping-row">
                  <div className="shopping-information">
                    <p>
                      {item.product.name} (£{item.product.price.toFixed(2)}) - {item.quantity}
                    </p>
                  </div>
                  <button onClick={() => removeFromBasket(item.product.id)}>Remove</button>
                </div>
              ))}
              <p>Total: £{totalBasketCost.toFixed(2)}</p> 
            </>
          )}
        </div>
      </div>
      <div id="search-bar">
        <input type="text" placeholder="Search..." onChange={changeEventObject => setSearchTerm(changeEventObject.target.value)}></input>
        <div id="control-area">
          <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
            <option value="AtoZ">By name (A - Z)</option>
            <option value="ZtoA">By name (Z - A)</option>
            <option value="£LtoH">By price (low - high)</option>
            <option value="£HtoL">By price (high - low)</option>
            <option value="*LtoH">By rating (low - high)</option>
            <option value="*HtoL">By rating (high - low)</option>
          </select>
          <input 
            id="inStock" 
            type="checkbox" 
            checked={showInStockOnly}
            onChange={(e) => setShowInStockOnly(e.target.checked)}
          ></input>
          <label htmlFor="inStock">In stock</label>
        </div>
      </div>
      <p id="results-indicator">{getResultsText()}</p>
      {/* Pass the addToBasket function to ProductList */}
      <ProductList itemList={searchedProducts} addToBasket={addToBasket}/>
    </div>
  )
}

export default App
