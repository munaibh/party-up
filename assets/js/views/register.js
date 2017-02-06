
define(['jquery', 'backbone', 'mustache', 'validate', 'text!templates/register.html'],
function($, _, Mustache, validate, LandingTmplt) {

  $.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
      if (o[this.name] !== undefined) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  };

  var RegisterView = Backbone.View.extend({

    el: "body",

    events: {
      'submit .cred-form' : 'nextStep',
      'submit .profile-form' : 'nextStep',
      'submit .avatar-form' : 'submit',
      "change #upload" : "avatarChange"
    },

    initialize: function() {
      this.render();
      var self = this;
      // Credential form Validation
      $('.cred-form').validate({

        rules: {
          username: {
            required: true, remote: "/auth/checkExisting"
          },
          password: {
            required: true, minlength: 3,
          },
          password_again: {
            required: true, equalTo: "#password"
          }
        },

        messages: {
          username: {
            remote: "This username is taken",
          },

          password: {
            minlength: "Password must be at least {0} characters",
          },

          password_again: {
            equalTo: "Passwords don't match",
          }
        },

        errorPlacement: function(error, element) {
          error.insertBefore(element);
        }
      });
      // Profile and Avatar Validation.
      $('.profile-form').validate();
      $('.avatar-form').validate({submitHandler: self.submit.bind(this)});

    },

    render: function() {
      // Array of countries
      $countries = ["Afghanistan", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegowina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Congo, the Democratic Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia (Hrvatska)", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "France Metropolitan", "French Guiana", "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard and Mc Donald Islands", "Holy See (Vatican City State)", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran (Islamic Republic of)", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, Democratic People's Republic of", "Korea, Republic of", "Kuwait", "Kyrgyzstan", "Lao, People's Democratic Republic", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libyan Arab Jamahiriya", "Liechtenstein", "Lithuania", "Luxembourg", "Macau", "Macedonia, The Former Yugoslav Republic of", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of", "Moldova, Republic of", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Seychelles", "Sierra Leone", "Singapore", "Slovakia (Slovak Republic)", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia and the South Sandwich Islands", "Spain", "Sri Lanka", "St. Helena", "St. Pierre and Miquelon", "Sudan", "Suriname", "Svalbard and Jan Mayen Islands", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan, Province of China", "Tajikistan", "Tanzania, United Republic of", "Thailand", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "United States Minor Outlying Islands", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Virgin Islands (British)", "Virgin Islands (U.S.)", "Wallis and Futuna Islands", "Western Sahara", "Yemen", "Yugoslavia", "Zambia", "Zimbabwe"];

      // Render register template and pass countries to template.
      var template = Mustache.render(LandingTmplt, {countries: $countries});
      this.$el.html(template);
    },


    nextStep: function(e) {
      // Show next form.
      $(e.target).next().removeClass('hide');
      // Slide previous form out of container.
      $(e.target).css({
        'height': '0px',
        'margin-left': "-" + ($(e.target).next().outerWidth() + 6)  + 'px',
      });
      return false;
    },

    submit: function(form) {
      // Generate and serialize data.
      var formData = new FormData(form);
      var cred = $('.cred-form').serializeArray();
      var profile = $('.profile-form').serializeArray();
      for (var key in cred ) { formData.append(cred[key].name, cred[key].value); }
      for (var key in profile ) { formData.append(profile[key].name, profile[key].value); }

      $.ajax({
         url: "/auth/register",
         method: 'POST',
         data: formData,
         processData: false,
         contentType: false,
         success: function(data) {
           // On success alert and redirect
           alert("You have been registered, try signing in.");
           window.location="/PartyUpBeta/";
         },
         error: function(data) {
           // on error alert message.
           alert("Something went wrong :( Try Again!");
         }
      });

      return false;
    },

    avatarChange: function(e) {
      // Retrieve avatar file and display.
      var self = e.target;
      var reader = new FileReader();
      reader.readAsDataURL(self.files[0]);
       reader.onload = function (e) {
         $('.upload-icon').css('background-image', 'url("' + e.target.result + '")');
         $(self).parent().attr('data-upload', "Change Avatar");
      }
    }

  });

  // Register view is now returned
  return RegisterView;

});
