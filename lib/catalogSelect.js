/** Product fields for fast list load (no images). */
export const PRODUCT_LIST_SELECT = [
  'id',
  'product_name',
  'description',
  'price',
  'price_amount',
  'sort_order',
  'created_at',
  'updated_at',
  'whatsapp_bot_item_colors(id,color_name,color_hex,sort_order)',
].join(',')

export const PRODUCT_IMAGE_SELECT = 'image_base64'

export const PRODUCT_LIST_ORDER = 'sort_order.asc,product_name.asc'

export const PRODUCT_COMPANY_FILTER = 'company=eq.sodamax'
