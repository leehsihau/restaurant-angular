import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ProcessHttpMsgService } from '../services/process-http-msg.service';
import { Feedback, ContactType } from '../shared/feedback';
import { baseURL } from '../shared/baseurl';
import { catchError } from 'rxjs/operators';

import { flyInOut, expand } from '../animations/app.animation';
import { FeedbackService } from '../services/feedback.service';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host: {
    '[@flyInOut]': 'true',
    'style': 'display: block;'
    },
    animations: [
      flyInOut(),
      expand()
    ]
})


export class ContactComponent implements OnInit {

  feedbackForm!: FormGroup;
  feedback!: Feedback;
  displayFeedback!: Feedback;
  isSuccessFromServer!: Boolean;
  isError!: Boolean;
  errMsg!: string;
  isInProcess!: Boolean;
  contactType = ContactType;
  constructor(private fb: FormBuilder, private feebackService: FeedbackService) {
    this.createForm();
  }
  formErrors: { [index: string]: any } = {
    'firstname': '',
    'lastname': '',
    'telnum': '',
    'email': ''
  };

  validationMessages: { [index: string]: any } = {
    'firstname': {
      'required': 'First Name is required.',
      'minlength': 'First Name must be at least 2 characters long.',
      'maxlength': 'FirstName cannot be more than 25 characters long.'
    },
    'lastname': {
      'required': 'Last Name is required.',
      'minlength': 'Last Name must be at least 2 characters long.',
      'maxlength': 'Last Name cannot be more than 25 characters long.'
    },
    'telnum': {
      'required': 'Tel. number is required.',
      'pattern': 'Tel. number must contain only numbers.'
    },
    'email': {
      'required': 'Email is required.',
      'email': 'Email not in valid format.'
    },
  };
  createForm() {
    this.feedbackForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)]],
      telnum: ['', [Validators.required, Validators.pattern]],
      email: ['', [Validators.required, Validators.email]],
      agree: false,
      contacttype: 'None',
      message: ''
    });
    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }
  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }



  onSubmit() {
    this.feedback = this.feedbackForm.value;
    console.log(this.feedback);
    this.isInProcess = true;
    this.feebackService.postFeedback(this.feedback).subscribe(async feedback => {
      this.isInProcess = false;
      this.displayFeedback = feedback;
      this.isSuccessFromServer = true;
      await delay(5000);
      //displaying returned data from server
      this.isError = false;
      this.isSuccessFromServer = false;
      this.displayFeedback = new Feedback();
      this.feedbackForm.reset();
    }, async errMsg => {
      this.isInProcess = false;
      this.isError = true;
      this.errMsg = errMsg;
      await delay(5000);
      //displaying returned data from server
      this.isError = false;
      this.isSuccessFromServer = false;
      this.displayFeedback = new Feedback();
      this.feedbackForm.reset();
    });



  }




  ngOnInit(): void {
  }

}
