export interface CreateProduct{
    name: string,
    description: string,
    category: string,
    price: number,
    stock: number,
    image: string,
}
export interface Product{
    id: string,
    name: string,
    description: string,
    category: string,
    price: number,
    stock: number,
    image: string,
}

export interface ReducedProductInfo{
    id: string,
    name: string,
    category: string,
    price: number,
    stock: number,
}

export interface UpdateProduct{
    name?: string,
    description?: string,
    category?: string,
    price?: number,
    stock?: number,
    image?: string,
}
export interface ProductFilters{
    name?: string,
    category?: string,
    minPrice?: number,
    maxPrice?: number,
    stock?: number,
    page?: number,
    limit?: number,
}