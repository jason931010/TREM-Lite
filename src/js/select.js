document.addEventListener("DOMContentLoaded", () => {
  console.log(true);
  const selectWrappers = document.querySelectorAll(".select-wrapper");

  selectWrappers.forEach((wrapper) => {
    const selected = wrapper.querySelector(".select-selected");
    const items = wrapper.querySelector(".select-items");

    selected.addEventListener("click", () => {
      console.log(selected);
      items.classList.toggle("select-hide");
    });

    const options = items.querySelectorAll("div");
    options.forEach((option) => {
      option.addEventListener("click", function() {
        const selectedText = this.textContent;
        selected.textContent = selectedText;
        items.classList.add("select-hide");
      });
    });
  });

  // Close the select item if user clicks outside of it
  document.addEventListener("click", (event) => {
    selectWrappers.forEach((wrapper) => {
      if (!wrapper.contains(event.target))
        wrapper.querySelector(".select-items").classList.add("select-hide");

    });
  });
});