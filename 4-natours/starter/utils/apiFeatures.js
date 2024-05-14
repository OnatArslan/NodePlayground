class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    // 1-A) FILTERING --------------------------------
    let queryObj = { ...this.queryString };
    // console.log(req.query);
    // define special queries
    let specialQueries = [`page`, `sort`, `limit`, `fields`];
    // remove special queries in queryObj if there
    specialQueries.forEach((element) => {
      delete queryObj[element];
    });

    // define query like this because Tour.find() function return a query (this is not await)
    // we can't declare tours here with await because we may need pagination or sorting and we use that functions on query object
    // End of process we define tours = await query
    // 1-B) ADVANCED FILTERING --------------------------------
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query.find(JSON.parse(queryStr));
    return this;
  }
  sort() {
    // 2) SORTING --------------------
    if (this.queryString.sort) {
      // sort() method work like this sort(`Sortby1` `Sortyby2`) but req.url is sort=Sortby1,Sortby2
      // because of that split(`,`) and then join(` `) make confortable with mongoDB syntax
      const sortBy = this.queryString.sort.split(`,`).join(` `); // we join with ` ` because mongodb will accept like that
      console.log(sortBy); // -> difficulty price --> this is legit syntax for mongoDb sort
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // -created at reverse sort, - mean reverse sort
    }
    return this;
  }
  limitFields() {
    // 3) FIELD LIMITING
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(`,`).join(' ');
      this.query = this.query.select(fields); // with select() function reduce traffic is projecting because we project to client that data
    } else {
      this.query = this.query.select(`-__v`); // On select() func. -__v means __v is not selected same operator in sort but different meaning
    }
    return this;
  }
  paginate() {
    // 4) PAGINATION -- EXTREMELY IMPORTANT FEATURE FOR BACKEND ----------------------------------
    const page = Number(this.queryString.page) || 1; //  req.query.page varsa page onun Number hali, defoult olarak 1
    const limit = Number(this.queryString.limit) || 20;
    const skip = limit * (page - 1);

    this.query = this.query.skip(skip).limit(limit); // ?page=2&limit=10  1-10 page1 11-20 page2 21-30 page3

    return this;
  }
}
module.exports = APIFeatures;
