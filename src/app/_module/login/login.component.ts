import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../_services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) { }


  ngOnInit(): void {
    this.initLoginForm();
  }
  initLoginForm(){
    this.loginForm = this.fb.group({
      userName: [null, [Validators.required]],
      password: [null, [Validators.required]],
      remember: [true]
    })
  }
  submitForm() {
    //this.authService.login();
  }
  
}
