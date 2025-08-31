
class PaginationUtils {
  static getPaginationParams(query) {
    const page = Math.max(1, Number.parseInt(query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit) || 10))
    const offset = (page - 1) * limit

    return { page, limit, offset }
  }

  static createPaginationResponse(page, limit, total) {
    const totalPages = Math.ceil(total / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null,
    }
  }
}

module.exports = PaginationUtils
