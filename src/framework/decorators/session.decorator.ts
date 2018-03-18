import * as localStorage from 'continuation-local-storage';
import { ClassType, Dictionary } from '@wazzu/iluvatar-core';
import { Session } from './../session';

const methodsThatRequireAuth: Dictionary<string, string[]> = {};
const classThatRequireAuth: string[] = [];

export function requireAuth(constructor?: ClassType): any {
    if (constructor) {
        classThatRequireAuth.push(constructor.name);
    } else {
        return function (target: ClassType, propertyKey: string, descriptor: PropertyDescriptor) {
            let methds = methodsThatRequireAuth[target.constructor.name]
            if (!methds) {
                methds = [];
            }
            methds.push(propertyKey)
        }
    }
}

export function classRequireAuth(className: string): boolean {
    return classThatRequireAuth.indexOf(className) > -1;
}

export function methodsRequireAuth(className: string, methodName: string): boolean {
    let classList = methodsThatRequireAuth[className];
    if (!classList) {
        return false;
    }

    return classList.indexOf(methodName) > -1;
}