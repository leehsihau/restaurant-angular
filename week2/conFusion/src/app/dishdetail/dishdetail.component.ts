import { Component, Inject, OnInit } from '@angular/core';
import {Params, ActivatedRoute } from '@angular/router';
import {Location} from '@angular/common';
import { Dish } from '../shared/dish';
import {DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {
  dish!: Dish;
  dishIds!: string[];
  prev!: string;
  next!: string;
  commentForm!: FormGroup;
  comment!: Comment;
  commentMsgPlaceholder!: string;
  namePlaceholder!: string;
  ratingPlaceholder!: number;
  errMsg!: string;


  constructor(private dishService: DishService, private routeService: ActivatedRoute, private location: Location, private fb: FormBuilder, @Inject('BaseURL') public BaseURL: string) {
    this.createForm();
   }

   formErrors: {[index: string]:any} = {
    'name': '',
    'commentMsg': ''
  };

  validationMessages: {[index: string]:any} = {
    'name': {
      'required':      'Name is required.',
      'minlength':     'Name must be at least 2 characters long.',
      'maxlength':     'Name cannot be more than 25 characters long.'
    },
    'commentMsg': {
      'required':      'Email is required.'
    },
  };

   createForm() {
    this.commentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      commentMsg: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      rating: ['', Validators.required]
    });
    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
   }
  ngOnInit() {
    this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.routeService.params.pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
    .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); }, errMsg=>this.errMsg=<any>errMsg);
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void{
    //this.location.back();
    window.location.href='http://localhost:4200/menu';

  }

  onSubmit() {
    this.comment = this.commentForm.value;
    var today = new Date();
    const commentplc = {
      author: this.commentForm.value.name,
      rating: this.commentForm.value.rating,
      comment: this.commentForm.value.commentMsg,
      date: new Date().toISOString().slice(0, 10)
    }
    console.log(this.comment);
    this.dish.comments?.push(commentplc);
    this.commentForm.reset({rating: 5});
  }

  checkErrorBeforeSubmit(){
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) return true;
    }
    return false;
  }

  displayPlaceholders(): boolean {
    if((this.commentMsgPlaceholder!=null && this.commentMsgPlaceholder!="") || (this.namePlaceholder!=null && this.namePlaceholder!="")) return true;
    return false;
  }



  onValueChanged(data?: any) {
    console.log(this.formErrors);
    if (!this.commentForm) { return; }
    const form = this.commentForm;
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



}
