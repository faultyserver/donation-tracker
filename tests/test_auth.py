import urllib.parse

from django.test import TestCase
from django.contrib.auth import get_user_model

import post_office.models
from django.test import override_settings

import tracker.auth
import tracker.tests.util as test_util

AuthUser = get_user_model()

TEST_AUTH_MAIL_TEMPLATE = post_office.models.EmailTemplate(
    content='user:{{user}}\nurl:{{reset_url}}'
)


@override_settings(EMAIL_FROM_USER='example@example.com')
class TestRegisterEmailSend(TestCase):
    def test_send_registration_email(self):
        newUser = AuthUser.objects.create(
            username='dummyuser', email='test@email.com', is_active=False
        )
        sentMail = tracker.auth.send_registration_mail(
            '', newUser, template=TEST_AUTH_MAIL_TEMPLATE
        )
        contents = test_util.parse_test_mail(sentMail)
        self.assertEqual(newUser.username, contents['user'][0])
        parsed = urllib.parse.urlparse(contents['url'][0])
        self.assertEqual(tracker.auth.make_auth_token_url_suffix(newUser), parsed.query)
        resp = self.client.get(parsed.path, data=urllib.parse.parse_qs(parsed.query))
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, 'Please set your username and password.')

    def test_send_password_reset_email(self):
        existingUser = AuthUser.objects.create(
            username='existinguser', email='test@email.com', is_active=True
        )
        sentMail = tracker.auth.send_password_reset_mail(
            '', existingUser, template=TEST_AUTH_MAIL_TEMPLATE
        )
        contents = test_util.parse_test_mail(sentMail)
        self.assertEqual(existingUser.username, contents['user'][0])
        parsed = urllib.parse.urlparse(contents['url'][0])
        self.assertEqual(
            tracker.auth.make_auth_token_url_suffix(existingUser), parsed.query
        )
        resp = self.client.get(parsed.path, data=urllib.parse.parse_qs(parsed.query))
        self.assertEqual(resp.status_code, 200)
        self.assertContains(resp, 'Please enter a new password.')

    def test_send_registration_email_existing_user_fails(self):
        existingUser = AuthUser.objects.create(
            username='existinguser', email='test@email.com', is_active=True
        )
        self.assertRaises(
            Exception,
            tracker.auth.send_registration_mail(
                '', existingUser, template=TEST_AUTH_MAIL_TEMPLATE
            ),
        )

    def test_send_password_reset_new_user_fails(self):
        newUser = AuthUser.objects.create(
            username='dummyuser', email='test@email.com', is_active=False
        )
        self.assertRaises(
            Exception,
            tracker.auth.send_password_reset_mail(
                '', newUser, template=TEST_AUTH_MAIL_TEMPLATE
            ),
        )
