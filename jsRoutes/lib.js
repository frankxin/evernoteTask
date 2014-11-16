//format timestamp to localTime
var date = new Date(parseInt(1415857107000, 10)).format("yyyy-MM-dd HH:mm");


Date.prototype.format = function(e) {
	var a = function(m, l) {
		var n = "",
			k = (m < 0),
			j = String(Math.abs(m));
		if (j.length < l) {
			n = (new Array(l - j.length + 1)).join("0")
		}
		return (k ? "-" : "") + n + j
	};
	if ("string" != typeof e) {
		return this.toString()
	}
	var b = function(k, j) {
		e = e.replace(k, j)
	};
	var f = this.getFullYear(),
		d = this.getMonth() + 1,
		i = this.getDate(),
		g = this.getHours(),
		c = this.getMinutes(),
		h = this.getSeconds();
	b(/yyyy/g, a(f, 4));
	b(/yy/g, a(parseInt(f.toString().slice(2), 10), 2));
	b(/MM/g, a(d, 2));
	b(/M/g, d);
	b(/dd/g, a(i, 2));
	b(/d/g, i);
	b(/HH/g, a(g, 2));
	b(/H/g, g);
	b(/hh/g, a(g % 12, 2));
	b(/h/g, g % 12);
	b(/mm/g, a(c, 2));
	b(/m/g, c);
	b(/ss/g, a(h, 2));
	b(/s/g, h);
	return e
};