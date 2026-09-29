const contactForm = document.getElementById("contact-form");
const successBox = document.getElementById("form-success");
const successName = document.getElementById("success-name");
const mailLink = document.getElementById("mail-link");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DIGITS_ONLY = /^[0-9]+$/;

const rules = [
  {
    name: "name",
    check: function (value) {
      return value === "" ? "Please enter your name." : "";
    }
  },
  {
    name: "email",
    check: function (value) {
      if (value === "") return "Please enter your email address.";
      if (!EMAIL_PATTERN.test(value)) return "Please enter a valid email address, such as name@example.com.";
      return "";
    }
  },
  {
    name: "phone",
    check: function (value) {
      if (value === "") return "Please enter your phone number.";
      if (!DIGITS_ONLY.test(value)) return "The phone number must contain digits only, with no spaces or symbols.";
      return "";
    }
  },
  {
    name: "message",
    check: function (value) {
      return value === "" ? "Please write a message." : "";
    }
  }
];

function showResult(input, message) {
  const field = input.closest(".field");
  field.classList.toggle("has-error", message !== "");
  field.querySelector(".field-error").textContent = message;
  if (message) {
    input.setAttribute("aria-invalid", "true");
  } else {
    input.removeAttribute("aria-invalid");
  }
}

function validate(rule) {
  const input = contactForm.elements[rule.name];
  const message = rule.check(input.value.trim());
  showResult(input, message);
  return message === "";
}

rules.forEach(function (rule) {
  const input = contactForm.elements[rule.name];

  input.addEventListener("blur", function () {
    if (input.value.trim() !== "") validate(rule);
  });

  input.addEventListener("input", function () {
    if (input.closest(".field").classList.contains("has-error")) validate(rule);
  });
});

contactForm.addEventListener("submit", function (event) {
  event.preventDefault();
  successBox.classList.remove("is-visible");

  const results = rules.map(validate);
  const valid = results.every(function (passed) { return passed; });

  if (!valid) {
    contactForm.querySelector(".has-error input, .has-error textarea").focus();
    return;
  }

  const data = new FormData(contactForm);
  const subject = "Message from " + data.get("name");
  const body = [data.get("message"), "", data.get("name"), data.get("email"), data.get("phone")].join("\n");

  mailLink.href = "mailto:officialjoshua9@gmail.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  successName.textContent = data.get("name");
  successBox.classList.add("is-visible");
  contactForm.reset();
});
