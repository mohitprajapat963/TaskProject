import React from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../App';
import { Formik } from 'formik';

function RegisterScreen({ navigation }: any) {
    const { signUp } = useAuth();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account 📝</Text>

            <Formik
                initialValues={{ email: '', password: '', name: '' }}
                validate={(values) => {
                    const errors: { email?: string; password?: string; name?: string; } = {};

                    if (!values.name) {
                        errors.name = 'Name is required'
                    }

                    if (!values.email) {
                        errors.email = 'Email is required';
                    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
                        errors.email = 'Please enter a valid email';
                    }

                    if (!values.password) {
                        errors.password = 'Password is required';
                    } else if (values.password.length < 6) {
                        errors.password = 'Password must be at least 6 characters';
                    }

                    return errors;
                }}
                onSubmit={async (values) => {
                    try {
                        await signUp({ name: values.name, email: values.email, password: values.password });
                    } catch (error) {
                        console.error(error);
                    }
                }}
            >
                {({
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    values,
                    errors,
                    touched,
                }) => (
                    <>
                        <TextInput
                            placeholder="Name"
                            style={styles.input}
                            onChangeText={handleChange('name')}
                            onBlur={handleBlur('name')}
                            value={values.name}
                            autoCapitalize="none"
                        />
                        {touched.name && errors.name && (
                            <Text style={styles.errorText}>{errors.name}</Text>
                        )}
                        <TextInput
                            placeholder="Email Address"
                            style={styles.input}
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            value={values.email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {touched.email && errors.email && (
                            <Text style={styles.errorText}>{errors.email}</Text>
                        )}

                        <TextInput
                            placeholder="Password"
                            style={styles.input}
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            value={values.password}
                            secureTextEntry
                        />
                        {touched.password && errors.password && (
                            <Text style={styles.errorText}>{errors.password}</Text>
                        )}

                        <Button title="Register" onPress={() => handleSubmit()} />
                    </>
                )}
            </Formik>

            <View style={styles.footer}>
                <Text>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.link}>Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
    },
    footer: { flexDirection: 'row', marginTop: 16, justifyContent: 'center' },
    link: { color: 'blue' },
    errorText: {
        color: 'red',
        marginBottom: 8,
        marginLeft: 4,
        fontSize: 12,
    },
});

export default RegisterScreen