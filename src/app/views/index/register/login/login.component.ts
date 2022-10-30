import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LanguageService } from 'src/app/services/language.service';

@Component({
    selector: 'app-index-register-login',
    templateUrl: './login.component.html',
    styleUrls: [
      './login.component.css'
    ],
})

export class LoginComponent implements OnInit{

  return_url = null;

  constructor(
    private router: ActivatedRoute,
    public language: LanguageService,
  ) {}

  ngOnInit () {
    this.return_url = this.router.snapshot.queryParams['return_url'];
  }
}
