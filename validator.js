// Đối tượng Validator
function Validator(options) {
    const getParent = (element, selector) => {
        while(element.parentElement){
            if(element.parentElement.matches(selector))
                return element.parentElement
            element = element.parentElement
        }
    }

    var selectorRules = {}

    const validate = (inputElement, rule) => {
        let errorMessage
        let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)

        // Lấy ra các rules của selector
        let rules = selectorRules[rule.selector]

        // Lặp qua từng rule để kiểm tra
        // Nếu có lỗi thì dừng việc kiểm tra
        for(let i=0; i<rules.length; i+=1){
            switch (inputElement.type){
                case "radio":
                case "checkbox":
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ":checked"))
                    break
                default:
                    errorMessage = rules[i](inputElement.value)
            }
            if(errorMessage)
                break
        }

        if(errorMessage){
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add("invalid")
        }
        else{
            errorElement.innerText = ""
            getParent(inputElement, options.formGroupSelector).classList.remove("invalid")
        }

        return !errorMessage
    }

    let formElement = document.querySelector(options.form)
    if(formElement){
        // Khi submit form
        formElement.onsubmit = (e) => {
            e.preventDefault()

            let isFormValid = true

            // Lặp qua từng rule và validate
            options.rules.forEach(rule => {
                let inputElement = formElement.querySelector(rule.selector)
                let isValid = validate(inputElement, rule)
                if(!isValid)
                    isFormValid = false
            })

            if(isFormValid){
                // Trường hợp submit với javascript
                if(typeof options.onSubmit === "function"){
                    let enableInputs = formElement.querySelectorAll('[name]')
                    let formValues = Array.from(enableInputs).reduce((values, input) => {
                        switch(input.type){
                            case "radio":
                                if(input.matches(":checked"))
                                    values[input.name] = input.value
                                break
                            case "checkbox":
                                if(!input.matches(":checked")){
                                    values[input.name] = ''
                                    return values
                                }
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break
                            case "file":
                                values[input.name] = input.files
                                break
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    }, {})

                    options.onSubmit(formValues)
                }
                // Trường hợp submit với hành vi mặc định
                else{
                    formElement.submit()
                }
            }
        }

        // Lặp qua mỗi rule và xử lý
        options.rules.forEach(rule => {
            // Lưu lại các rule cho mỗi input
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }
            else{
                selectorRules[rule.selector] = [rule.test]
            }

            let inputElements = Array.from(formElement.querySelectorAll(rule.selector))
            inputElements.forEach(inputElement => {
                // Xử lý khi người dùng blur khỏi input
                inputElement.onblur = () => {
                    validate(inputElement, rule)
                }

                // Xử lý khi người dùng gõ vào input
                inputElement.oninput = () => {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ""
                    getParent(inputElement, options.formGroupSelector).classList.remove("invalid")
                }
            })
        })
    }
}

// Định nghĩa rules

Validator.isRequired = (selector, message) => {
    return {
        selector: selector,
        test: (value) => value ? undefined : message || "Vui lòng nhập vào trường này"
    }
}

Validator.isEmail = (selector, message) => {
    return {
        selector: selector,
        test: (value) => {
            let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || "Trường này phải là email!";
        }
    }
}

Validator.minLength = (selector, min, message) => {
    return {
        selector: selector,
        test: (value) => {
            return value.length >= min ? undefined : message || `Mật khẩu phải có từ ${min} ký tự trở lên!`
        }
    }
}

Validator.isConfirmed = (selector, getConfirmValue, message) => {
    return {
        selector: selector,
        test: (value) => {
            return value === getConfirmValue() ? undefined : message || "Giá trị nhập vào không chính xác!"
        }
    }
}