{% set leancloud_uri = '//cdn.jsdelivr.net/npm/leancloud-storage@3.11.1/dist/av-min.js' %}
{% if theme.vendors.leancloud %}
  {% set leancloud_uri = theme.vendors.leancloud %}
{% endif %}
<script src="{{ leancloud_uri }}"></script>

{% set valine_uri = '//cdn.jsdelivr.net/npm/valine@1.5.3/dist/Valine.min.js' %}
{% if theme.vendors.valine %}
  {% set valine_uri = theme.vendors.valine %}
{% endif %}
<script src="{{ valine_uri }}"></script>

<script>
  var GUEST = ['nick', 'mail', 'link'];
  var guest = '{{ theme.valine.guest_info }}';
  guest = guest.split(',').filter(function(item) {
    return GUEST.indexOf(item) > -1;
  });
  new Valine({
    el: '#comments',
    verify: {{ theme.valine.verify }},
    notify: {{ theme.valine.notify }},
    appId: '{{ theme.valine.appid }}',
    appKey: '{{ theme.valine.appkey }}',
    placeholder: '{{ theme.valine.placeholder }}',
    avatar: '{{ theme.valine.avatar }}',
    serverURLs: '{{ theme.valine.serverURLs }}',
    meta: guest,
    pageSize: '{{ theme.valine.pageSize }}' || 10,
    visitor: {{ theme.valine.visitor }}
  });
</script>
