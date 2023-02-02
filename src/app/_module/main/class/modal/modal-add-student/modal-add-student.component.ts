import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'aio-modal-add-student',
  templateUrl: './modal-add-student.component.html',
  styleUrls: ['./modal-add-student.component.scss'],
})
export class ModalAddStudentComponent implements OnInit {
  addStudentForm!: FormGroup;
  isChangeInput = false;
  checked = false;
  loading = false;
  indeterminate = false;
  students = [
    {
      id: 1,
      name: 'Pham Anh A',
      phone: '089890909',
    },
    {
      id: 2,
      name: 'Pham Anh B',
      phone: '089121212',
    },
  ];

  setOfCheckedId = new Set<number>();
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initAddStudentForm();
  }

  initAddStudentForm() {
    this.addStudentForm = this.fb.group({
      search: [''],
    });
  }

  addStudent() {}

  onDeleteInput() {
    this.f['search'].setValue(null);
    this.isChangeInput = false;
  }

  onChangeSearchInput(event: any) {
    this.isChangeInput = true;
  }

  onAllChecked(checked: boolean): void {
    this.students.forEach(({ id }) => this.updateCheckedSet(id, checked));
    // this.refreshCheckedStatus();
  }

  onItemChecked(id: number, event: any): void {
    this.updateCheckedSet(id, event);
    // this.refreshCheckedStatus();
  }

  updateCheckedSet(id: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(id);
    } else {
      this.setOfCheckedId.delete(id);
    }
  }

  get f() {
    return this.addStudentForm.controls;
  }
}
