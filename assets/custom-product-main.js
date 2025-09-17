document.addEventListener("DOMContentLoaded", function () {
  function showVariantGallery(variantId) {
    if (!variantId) return;

    document.querySelectorAll(".custom-product__gallery-wrap").forEach(function (g) {
      g.style.display = "none";
    });

    var gallery = document.querySelector('.custom-product__gallery-wrap[data-variant="' + variantId + '"]');
    if (gallery) gallery.style.display = "flex";

    if (window.swipers && window.swipers[variantId]) {
      // quick timeout to let dom reload display property
      setTimeout(function () {
        try {
          window.swipers[variantId].main.update();
          window.swipers[variantId].thumb.update();
        } catch (e) {
          // ignore
        }
      }, 50);
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const currentVariantId = urlParams.get("variant");

  let targetCircle;

  if (currentVariantId) {
    targetCircle = document.querySelector(`.custom-product-main-variants__circle[data-variant-id="${currentVariantId}"]`);
  }

  if (!targetCircle) {
    targetCircle = document.querySelector(".custom-product-main-variants__circle");
  }

  if (targetCircle) {
    document.querySelectorAll(".custom-product-main-variants__circle").forEach((c) => c.classList.remove("active"));
    targetCircle.classList.add("active");
  }

  document.querySelectorAll(".custom-product-main-variants__circle").forEach(function (circle) {
    circle.addEventListener("click", function () {
      var targetVariantId = this.dataset.variantId;
      if (!targetVariantId) return;

      showVariantGallery(targetVariantId);

      document.querySelectorAll(".custom-product-main-variants__circle").forEach(function (c) {
        c.classList.remove("active");
      });
      this.classList.add("active");

      var variantSelect = document.querySelector('select[name="id"]');
      if (variantSelect) {
        variantSelect.value = targetVariantId;
        variantSelect.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        var radio = document.querySelector('input[name="id"][value="' + targetVariantId + '"]');
        if (radio) {
          radio.checked = true;
          radio.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    });
  });

  var active = document.querySelector(".custom-product-main-variants__circle.active");
  if (active && active.dataset.variantId) {
    showVariantGallery(active.dataset.variantId);
  } else {
    var sel = document.querySelector('select[name="id"]');
    if (sel) showVariantGallery(sel.value);
  }

  function formatMoney(cents) {
    const amount = (cents / 100).toFixed(2);
    return `₴${amount}`;
  }

  // ajax price change by change of variants
  document.querySelectorAll(".custom-product-main-variants__circle, .custom-product-siblings-variants__circle").forEach((circle) => {
    circle.addEventListener("click", function () {
      const variantId = this.dataset.variantId;
      if (!variantId) return;

      const formInput = document.querySelector('form[action="/cart/add"] input[name="id"]');
      if (formInput) {
        formInput.value = variantId;
        formInput.dispatchEvent(new Event("change", { bubbles: true }));
      }

      fetch(`/variants/${variantId}.js`)
        .then((res) => res.json())
        .then((variant) => {
          const priceEl = document.querySelector(".custom-product-main__price .new-price");
          const compareEl = document.querySelector(".custom-product-main__price .old-price");

          if (priceEl) priceEl.textContent = formatMoney(variant.price);
          if (compareEl) {
            if (variant.compare_at_price && variant.compare_at_price > variant.price) {
              compareEl.textContent = formatMoney(variant.compare_at_price);
              compareEl.style.display = "inline";
            } else {
              compareEl.style.display = "none";
            }
          }
        })
        .catch((err) => console.error("Error by adding vqriant:", err));
    });
  });

  // Accordion part
  const accordion = document.querySelector(".custom-product__accordeon");
  if (!accordion) return;

  const items = accordion.querySelectorAll(".custom-product__accordeon-item");
  const format = accordion.dataset.format;

  items.forEach((item) => {
    const title = item.querySelector(".accordeon-item__title");
    const content = item.querySelector(".accordeon-item__content");

    title.addEventListener("click", () => {
      const isOpen = content.classList.contains("open");

      if (format === "alone_active_element") {
        items.forEach((i) => {
          i.querySelector(".accordeon-item__content").classList.remove("open");
          i.querySelector(".accordeon-item__content").style.maxHeight = null;
        });
      }

      if (!isOpen) {
        content.classList.add("open");
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        content.classList.remove("open");
        content.style.maxHeight = null;
      }
    });
  });
});
