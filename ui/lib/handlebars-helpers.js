module.exports = {
  domain: function() {
    return process.env.DOMAIN || '';
  },
  formatPrice: function(price) {
    if(price) {
      return price / 100 + '$';
    } else {
      return 'Free';
    }
  }
}
